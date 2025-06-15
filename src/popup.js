import { saveProfile, loadProfiles, createProfileButton, deleteProfile, updateProfile } from './profileManager.js';
import { changeSteamProfile } from './steamProfileChanger.js';
import { loadSettings, saveSettings } from './settingsManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  const addButton = document.getElementById('add-button');
  const formModal = document.getElementById('form-modal');
  const saveProfileButton = document.getElementById('save-profile');
  const cancelFormButton = document.getElementById('cancel-form');
  const profilesContainer = document.getElementById('profiles-container');
  const confirmDialog = document.getElementById('confirm-dialog');
  const cancelDeleteButton = document.getElementById('cancel-delete');
  const confirmDeleteButton = document.getElementById('confirm-delete');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const saveSettingsButton = document.getElementById('save-settings');
  
  let profileToDelete = null;
  let isUpdating = false;
  let profileToUpdate = null;

  // Load existing profiles and settings
  await Promise.all([
    updateProfilesList(),
    loadAndDisplaySettings()
  ]);

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      
      // Update active states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });

  // Settings handlers
  async function loadAndDisplaySettings() {
    const settings = await loadSettings();
    document.getElementById('timeout-speed').value = settings.speed;
  }

  // Sauvegarder automatiquement lors du changement de vitesse
  document.getElementById('timeout-speed').addEventListener('change', async (e) => {
    const speed = e.target.value;
    if (await saveSettings(speed)) {
      // Afficher un feedback visuel temporaire
      const select = e.target;
      const originalBackground = select.style.backgroundColor;
      select.style.backgroundColor = 'var(--secondary-color)';
      select.style.color = 'var(--primary-color)';
      
      setTimeout(() => {
        select.style.backgroundColor = originalBackground;
        select.style.color = 'var(--text-color)';
      }, 500);
    }
  });

  // Add button handler
  addButton.addEventListener('click', () => {
    isUpdating = false;
    document.querySelector('.modal-dialog h3').textContent = 'Add New Profile';
    formModal.classList.add('active');
  });

  // Form cancel button handler
  cancelFormButton.addEventListener('click', () => {
    formModal.classList.remove('active');
    clearForm();
  });

  // Close form modal when clicking outside
  formModal.addEventListener('click', (e) => {
    if (e.target === formModal) {
      formModal.classList.remove('active');
      clearForm();
    }
  });

  // Profile save handler
  saveProfileButton.addEventListener('click', async () => {
    const websiteName = document.getElementById('website-name').value;
    const profileName = document.getElementById('profile-name').value;
    const profileImage = document.getElementById('profile-image').value;
    const websiteUrl = document.getElementById('website-url').value;

    if (websiteName && profileName && profileImage) {
      if (isUpdating && profileToUpdate !== null) {
        await updateProfile(profileToUpdate.index, { websiteName, profileName, profileImage, websiteUrl });
        profileToUpdate = null;
      } else {
        await saveProfile({ websiteName, profileName, profileImage, websiteUrl });
      }
      formModal.classList.remove('active');
      clearForm();
      await updateProfilesList();
    }
  });

  // Confirmation dialog handlers
  cancelDeleteButton.addEventListener('click', () => {
    confirmDialog.classList.remove('active');
    profileToDelete = null;
  });

  confirmDeleteButton.addEventListener('click', async () => {
    if (profileToDelete !== null) {
      await deleteProfile(profileToDelete);
      confirmDialog.classList.remove('active');
      profileToDelete = null;
      await updateProfilesList();
    }
  });

  // Close confirmation dialog when clicking outside
  confirmDialog.addEventListener('click', (e) => {
    if (e.target === confirmDialog) {
      confirmDialog.classList.remove('active');
      profileToDelete = null;
    }
  });

  async function updateProfilesList() {
    const profiles = await loadProfiles();
    profilesContainer.innerHTML = '';
    
    profiles.forEach((profile, index) => {
      const profileButton = createProfileButton(
        profile, 
        index, 
        changeSteamProfile,
        async (indexToDelete) => {
          profileToDelete = indexToDelete;
          confirmDialog.classList.add('active');
        },
        async (profileToEdit, index) => {
          isUpdating = true;
          profileToUpdate = { profile: profileToEdit, index };
          
          // Fill form with existing data
          document.getElementById('website-name').value = profileToEdit.websiteName;
          document.getElementById('profile-name').value = profileToEdit.profileName;
          document.getElementById('profile-image').value = profileToEdit.profileImage;
          document.getElementById('website-url').value = profileToEdit.websiteUrl || '';
          
          // Update modal title
          document.querySelector('.modal-dialog h3').textContent = 'Update Profile';
          
          // Show modal
          formModal.classList.add('active');
        }
      );
      profilesContainer.appendChild(profileButton);
    });
  }
  
  function clearForm() {
    document.getElementById('website-name').value = '';
    document.getElementById('profile-name').value = '';
    document.getElementById('profile-image').value = '';
    document.getElementById('website-url').value = '';
    isUpdating = false;
    profileToUpdate = null;
  }
});