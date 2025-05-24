export function saveProfile(profile) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      profiles.push(profile);
      chrome.storage.local.set({ profiles }, () => {
        updateEmptyState(profiles.length);
        resolve();
      });
    });
  });
}

export function loadProfiles() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      updateEmptyState(profiles.length);
      resolve(profiles);
    });
  });
}

export function deleteProfile(index) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      profiles.splice(index, 1);
      chrome.storage.local.set({ profiles }, () => {
        updateEmptyState(profiles.length);
        resolve();
      });
    });
  });
}

function updateEmptyState(profileCount) {
  const emptyState = document.getElementById('empty-state');
  const profilesContainer = document.getElementById('profiles-container');
  
  if (profileCount === 0) {
    emptyState.classList.add('visible');
    profilesContainer.style.display = 'none';
  } else {
    emptyState.classList.remove('visible');
    profilesContainer.style.display = 'block';
  }
}

export function createProfileButton(profile, index, onProfileClick, onDeleteClick) {
  const template = document.getElementById('profile-template');
  const profileElement = template.content.cloneNode(true);
  
  const button = profileElement.querySelector('.profile-button');
  const img = profileElement.querySelector('img');
  const profileName = profileElement.querySelector('.profile-name');
  const websiteName = profileElement.querySelector('.website-name');
  const websiteUrl = profileElement.querySelector('.website-url');
  const websiteUrlText = websiteUrl.querySelector('span');
  const deleteButton = profileElement.querySelector('.delete-profile');
  
  img.src = profile.profileImage;
  img.alt = profile.websiteName;
  profileName.textContent = profile.profileName;
  websiteName.textContent = profile.websiteName;
  
  if (profile.websiteUrl) {
    websiteUrl.href = profile.websiteUrl;
    websiteUrlText.textContent = new URL(profile.websiteUrl).hostname;
    websiteUrl.style.display = 'flex';
  } else {
    websiteUrl.style.display = 'none';
  }
  
  button.addEventListener('click', (e) => {
    if (!e.target.closest('.delete-profile') && !e.target.closest('.website-url')) {
      onProfileClick(profile);
    }
  });
  
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    onDeleteClick(index);
  });
  
  return profileElement;
}

export const DEFAULT_PROFILE = {
  profileName: "Steam",
  websiteName: "Steam",
  websiteUrl: "https://store.steampowered.com",
  profileImage: "https://store.steampowered.com/favicon.ico"
};

export function resetToDefaultProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 
      profiles: [DEFAULT_PROFILE],
      defaultProfileSet: true 
    }, () => {
      updateEmptyState(1);
      resolve();
    });
  });
}

export function isDefaultProfileSet() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['defaultProfileSet'], (result) => {
      resolve(result.defaultProfileSet || false);
    });
  });
}

export function isResetProfileSet() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      const resetProfile = profiles.find(p => p.isResetProfile);
      resolve(!!resetProfile);
    });
  });
}

export function getResetProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      const resetProfile = profiles.find(p => p.isResetProfile);
      resolve(resetProfile);
    });
  });
}

export function saveResetProfile(profile) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      const resetProfileIndex = profiles.findIndex(p => p.isResetProfile);
      
      // Ajouter le marqueur de profil de réinitialisation
      const resetProfile = { ...profile, isResetProfile: true };
      
      if (resetProfileIndex !== -1) {
        // Mettre à jour le profil de réinitialisation existant
        profiles[resetProfileIndex] = resetProfile;
      } else {
        // Ajouter le nouveau profil de réinitialisation
        profiles.push(resetProfile);
      }
      
      chrome.storage.local.set({ profiles }, () => {
        updateEmptyState(profiles.length);
        resolve();
      });
    });
  });
} 