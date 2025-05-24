import { saveProfile, loadProfiles, createProfileButton, deleteProfile } from './profileManager.js';
import { changeSteamProfile } from './steamProfileChanger.js';

document.addEventListener('DOMContentLoaded', async () => {
  const addButton = document.getElementById('add-button');
  const formModal = document.getElementById('form-modal');
  const saveProfileButton = document.getElementById('save-profile');
  const cancelFormButton = document.getElementById('cancel-form');
  const profilesContainer = document.getElementById('profiles-container');
  const confirmDialog = document.getElementById('confirm-dialog');
  const cancelDeleteButton = document.getElementById('cancel-delete');
  const confirmDeleteButton = document.getElementById('confirm-delete');
  
  let profileToDelete = null;

  // Load existing profiles
  await updateProfilesList();

  // Add button handler
  addButton.addEventListener('click', () => {
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
      await saveProfile({ websiteName, profileName, profileImage, websiteUrl });
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
  }
});