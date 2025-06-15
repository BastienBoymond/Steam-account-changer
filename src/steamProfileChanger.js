import { loadSettings } from './settingsManager.js';

export async function changeSteamProfile(profile) {
  const settings = await loadSettings();
  changeSteamProfileName(profile, settings);
  changeSteamProfilePicture(profile, settings);
  openWebsite(profile.websiteUrl);
}

function openWebsite(url) {
  console.log("Ouverture du site web:", url);
  if (url) {
    chrome.tabs.create({
      url: url,
    });
  } else {
    console.log("URL non valide");
  }
}

function changeSteamProfileName(profile, settings) {
  chrome.tabs.create({
    url: 'https://steamcommunity.com/my/edit',
    active: false
  }, async (tab) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: async (profileData) => {
          const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
          
          await sleep(profileData.settings.nameChangeTimeout);
          console.log("Tentative de modification du profil");
         
          console.log("Tentative de modification du profil");
          const nameInputs = document.getElementsByName('personaName');
          if (nameInputs && nameInputs.length > 0) {
            const nameInput = nameInputs[0];
            nameInput.value = profileData.profileName;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
            const button = document.querySelector('button[type="submit"]');
            button.click();
            console.log("Nom du profil modifié avec succès");
            setTimeout(() => {
              chrome.runtime.sendMessage({ action: 'closeTab', tabId: profileData.tabId });
            }, 1000);
          } else {
            console.log("Élément de nom non trouvé");
            chrome.runtime.sendMessage({ action: 'closeTab', tabId: profileData.tabId });
          }
        },
        args: [{ ...profile, tabId: tab.id, settings }]
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution du script:", error);
      chrome.tabs.remove(tab.id);
    }
  });
}

function changeSteamProfilePicture(profile, settings) {
  chrome.tabs.create({
    url: 'https://steamcommunity.com/my/edit/avatar',
    active: false
  }, async (tab) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: async (profileData) => {
          const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
          
          await sleep(profileData.settings.avatarChangeTimeout);
          console.log("Page chargée, début du processus");
          
          const container = document.querySelector('._22EnaYFQb5I0kYtH2UHEhV');
          const fileInput = container?.querySelector('input[type="file"]');
          
          if (fileInput) {
            try {
              const response = await fetch(profileData.profileImage);
              const blob = await response.blob();
              const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
              
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInput.files = dataTransfer.files;
              
              fileInput.dispatchEvent(new Event('input', { bubbles: true }));
              fileInput.dispatchEvent(new Event('change', { bubbles: true }));
              
              await sleep(profileData.settings.uploadButtonTimeout);
              
              const buttons = Array.from(document.querySelectorAll('button'));
              const uploadButton = buttons.find(b => 
                b.textContent.includes('Enregistrer') || 
                b.textContent.includes('Save') ||
                b.textContent.includes('Upload') ||
                b.textContent.includes('Télécharger')
              );
              
              if (uploadButton) {
                uploadButton.click();
                await sleep(200);
                chrome.runtime.sendMessage({ action: 'closeTab', tabId: profileData.tabId });
              } else {
                chrome.runtime.sendMessage({ action: 'closeTab', tabId: profileData.tabId });
              }
            } catch (error) {
              chrome.runtime.sendMessage({ action: 'closeTab', tabId: profileData.tabId });
            }
          } else {
            chrome.runtime.sendMessage({ action: 'closeTab', tabId: profileData.tabId });
          }
        },
        args: [{ ...profile, tabId: tab.id, settings }]
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution du script:", error);
      chrome.tabs.remove(tab.id);
    }
  });
} 