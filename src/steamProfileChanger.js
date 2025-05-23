export function changeSteamProfile(profile) {
  changeSteamProfileName(profile);
  changeSteamProfilePicture(profile);
}

function changeSteamProfileName(profile) {
  chrome.tabs.create({
    url: 'https://steamcommunity.com/my/edit',
    active: false
  }, async (tab) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: (profileData) => {
          console.log("Tentative de modification du profil");
          setTimeout(() => {
            console.log("Tentative de modification du profil");
            const nameInputs = document.getElementsByName('personaName');
            if (nameInputs && nameInputs.length > 0) {
              const nameInput = nameInputs[0];
              nameInput.value += profileData.profileName;
              nameInput.dispatchEvent(new Event('input', { bubbles: true }));
              nameInput.dispatchEvent(new Event('change', { bubbles: true }));
              const button = document.querySelector('button[type="submit"]');
              button.click();
              console.log("Nom du profil modifié avec succès");
              setTimeout(() => {
                chrome.runtime.sendMessage({ action: 'closeTab', tabId: profileData.tabId });
              }, 2000);
            } else {
              console.log("Élément de nom non trouvé");
              chrome.runtime.sendMessage({ action: 'closeTab', tabId: profileData.tabId });
            }
          }, 3000);
        },
        args: [{ ...profile, tabId: tab.id }]
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution du script:", error);
      chrome.tabs.remove(tab.id);
    }
  });
}

function changeSteamProfilePicture(profile) {
  chrome.tabs.create({
    url: 'https://steamcommunity.com/my/edit/avatar',
    active: false
  }, async (tab) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: async (profileData) => {
          const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
          
          await sleep(3000);
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
              
              await sleep(2000);
              
              const buttons = Array.from(document.querySelectorAll('button'));
              const uploadButton = buttons.find(b => 
                b.textContent.includes('Enregistrer') || 
                b.textContent.includes('Save') ||
                b.textContent.includes('Upload') ||
                b.textContent.includes('Télécharger')
              );
              
              if (uploadButton) {
                uploadButton.click();
                await sleep(2000);
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
        args: [{ ...profile, tabId: tab.id }]
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution du script:", error);
      chrome.tabs.remove(tab.id);
    }
  });
} 