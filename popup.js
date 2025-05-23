document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add-button');
  const formContainer = document.getElementById('form-container');
  const saveProfileButton = document.getElementById('save-profile');
  const profilesContainer = document.getElementById('profiles-container');

  // Charger les profils existants
  loadProfiles();

  // Gestionnaire pour le bouton d'ajout
  addButton.addEventListener('click', () => {
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
  });

  // Gestionnaire pour la sauvegarde du profil
  saveProfileButton.addEventListener('click', () => {
    const websiteName = document.getElementById('website-name').value;
    const profileName = document.getElementById('profile-name').value;
    const profileImage = document.getElementById('profile-image').value;

    if (websiteName && profileName && profileImage) {
      saveProfile({ websiteName, profileName, profileImage });
      formContainer.style.display = 'none';
      clearForm();
      loadProfiles();
    }
  });

  function saveProfile(profile) {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      profiles.push(profile);
      chrome.storage.local.set({ profiles });
    });
  }

  function loadProfiles() {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      profilesContainer.innerHTML = '';
      
      profiles.forEach((profile, index) => {
        const profileButton = createProfileButton(profile, index);
        profilesContainer.appendChild(profileButton);
      });
    });
  }

  function createProfileButton(profile, index) {
    const button = document.createElement('div');
    button.className = 'profile-button';
    button.innerHTML = `
      <img src="${profile.profileImage}" alt="${profile.websiteName}">
      <span>${profile.websiteName} - ${profile.profileName}</span>
    `;
    
    button.addEventListener('click', () => {
      changeSteamProfileName(profile);
      changeSteamProfilePicture(profile);
    });

    return button;
  }

  function changeSteamProfileName(profile) {
    // Ouvrir la page de modification de profil Steam
    chrome.tabs.create({
      url: 'https://steamcommunity.com/my/edit'
    }, async (tab) => {
      try {
        // Attendre que la permission soit accordée
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: (profileData) => {
            console.log("Tentative de modification du profil");
            // Attendre que la page soit chargée
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
              } else {
                console.log("Élément de nom non trouvé");
              }
            }, 3000);
          },
          args: [profile]
        });
      } catch (error) {
        console.error("Erreur lors de l'exécution du script:", error);
      }
    });
  }

  function changeSteamProfilePicture(profile) {
    chrome.tabs.create({
      url: 'https://steamcommunity.com/my/edit/avatar'
    }, async (tab) => {
      try {
        console.log("Ouverture de la page d'édition de l'avatar");
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: async (profileData) => {
            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            
            // Attendre que la page soit chargée
            await sleep(3000);
            console.log("Page chargée, début du processus");
            console.log("URL de l'image à utiliser:", profileData.profileImage);
            
            const container = document.querySelector('._22EnaYFQb5I0kYtH2UHEhV');
            console.log("Container trouvé:", !!container);
            
            const fileInput = container?.querySelector('input[type="file"]');
            console.log("Input file trouvé:", !!fileInput);
            
            if (fileInput) {
              try {
                console.log("Début du téléchargement de l'image");
                const response = await fetch(profileData.profileImage);
                console.log("Réponse fetch:", response.status, response.statusText);
                
                const blob = await response.blob();
                console.log("Blob créé:", {
                  type: blob.type,
                  size: blob.size
                });
                
                // Créer un nouveau fichier
                const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
                console.log("Fichier créé:", {
                  name: file.name,
                  type: file.type,
                  size: file.size
                });

                // Créer un nouveau FileList
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                
                // Assigner directement le fichier à l'input
                fileInput.files = dataTransfer.files;
                console.log("Fichiers assignés à l'input:", fileInput.files.length);

                // Attendre un peu avant de déclencher les événements
                await sleep(1000);

                // Créer et dispatcher un événement input
                const inputEvent = new Event('input', {
                  bubbles: true,
                  cancelable: true,
                });
                fileInput.dispatchEvent(inputEvent);
                console.log("Événement input dispatché");

                await sleep(1000);

                // Créer et dispatcher un événement change
                const changeEvent = new Event('change', {
                  bubbles: true,
                  cancelable: true,
                });
                fileInput.dispatchEvent(changeEvent);
                console.log("Événement change dispatché");

                // Attendre que l'image soit traitée
                await sleep(2000);

                // Trouver et cliquer sur le bouton de validation
                const buttons = Array.from(document.querySelectorAll('button'));
                console.log("Boutons trouvés:", buttons.map(b => ({
                  text: b.textContent,
                  class: b.className
                })));

                const uploadButton = buttons.find(b => 
                  b.textContent.includes('Enregistrer') || 
                  b.textContent.includes('Save') ||
                  b.textContent.includes('Upload') ||
                  b.textContent.includes('Télécharger')
                );

                if (uploadButton) {
                  console.log("Bouton trouvé:", uploadButton.textContent);
                  uploadButton.click();
                  console.log("Clic sur le bouton effectué");
                  
                  // Attendre que la sauvegarde soit effectuée
                  await sleep(2000);
                  
                  // Vérifier si un message de succès est présent
                  const successMessage = document.querySelector('.success_message');
                  if (successMessage) {
                    console.log("Sauvegarde réussie !");
                  } else {
                    console.log("Pas de message de succès trouvé");
                  }
                } else {
                  console.log("Aucun bouton de validation trouvé");
                }

              } catch (error) {
                console.error("Erreur détaillée:", {
                  message: error.message,
                  stack: error.stack,
                  name: error.name
                });
              }
            } else {
              console.log("Input file non trouvé");
            }
          },
          args: [profile]
        });
      } catch (error) {
        console.error("Erreur lors de l'exécution du script:", error);
      }
    });
  }
  
  function clearForm() {
    document.getElementById('website-name').value = '';
    document.getElementById('profile-name').value = '';
    document.getElementById('profile-image').value = '';
  }
}); 