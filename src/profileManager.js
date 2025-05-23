export function saveProfile(profile) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      profiles.push(profile);
      chrome.storage.local.set({ profiles }, () => resolve());
    });
  });
}

export function loadProfiles() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      resolve(profiles);
    });
  });
}

export function createProfileButton(profile, index, onProfileClick) {
  const button = document.createElement('div');
  button.className = 'profile-button';
  button.innerHTML = `
    <img src="${profile.profileImage}" alt="${profile.websiteName}">
    <span>${profile.websiteName} - ${profile.profileName}</span>
  `;
  
  button.addEventListener('click', () => onProfileClick(profile));
  return button;
} 