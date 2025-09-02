document.addEventListener("DOMContentLoaded", async function () {
  // Theme switching functionality
  function initThemeSwitcher() {
    const themeSwitcher = document.querySelector('.theme-switcher');
    const themeIcon = document.querySelector('.theme-icon');
    const root = document.documentElement;
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);
    updateThemeSwitcher(savedTheme);
    
    themeSwitcher.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeSwitcher(newTheme);
    });
  }
  
  function updateThemeSwitcher(theme) {
    const themeSwitcher = document.querySelector('.theme-switcher');
    const themeIcon = document.querySelector('.theme-icon');
    
    themeSwitcher.setAttribute('data-theme', theme);
    themeIcon.className = `theme-icon fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`;
  }

  // Function to fetch ayah data from JSON file
  async function fetchAyahData() {
    try {
      const response = await fetch('ayahData.json');
      if (!response.ok) throw new Error('Failed to load ayah data');
      return await response.json();
    } catch (error) {
      console.error('Error loading ayah data:', error);
      // Fallback to hardcoded data in case of error
      return fallbackAyahData;
    }
  }

  // Get current position in the cycle
  async function getCurrentPosition() {
    try {
      const data = await chrome.storage.local.get(['currentPosition']);
      return data.currentPosition || 0;
    } catch (error) {
      console.error('Error getting position:', error);
      return 0;
    }
  }

  // Save next position
  async function saveNextPosition(totalAyahs, currentPosition) {
    const nextPosition = (currentPosition + 1) % totalAyahs;
    await chrome.storage.local.set({ currentPosition: nextPosition });
  }

  // Get next ayah in the cycle
  async function getNextAyah(ayahData) {
    const currentPosition = await getCurrentPosition();
    const ayah = ayahData[currentPosition];
    await saveNextPosition(ayahData.length, currentPosition);
    return ayah;
  }

  // Fallback data in case loading fails
  const fallbackAyahData = [
    {
      theme: {
        name_en: "Trust in Allah",
        name_ar: "تَوَكُّل",
        slug: "tawakkul"
      },
      ayah: {
        arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
        translation: "And whoever puts their trust in Allah – He is sufficient for them.",
        reference: "Surah At-Talaq, 65:3"
      },
      tafsir: "This ayah is a quiet promise for hearts overwhelmed by uncertainty. Tawakkul doesn't mean doing nothing — it means doing your part, then handing over the outcome to the One who sees what you cannot. When you trust Allah fully, He fills in the gaps. He carries what you can't. He becomes enough — not just for your needs, but for your soul."
    }
  ];

  // Function to update the UI with ayah data
  function updateUI(data) {
    document.getElementById('ayahArabic').innerText = data.ayah.arabic;
    document.getElementById('ayahTranslation').innerText = `"${data.ayah.translation}"`;
    
    // Make reference clickable if URL exists
    const referenceElement = document.getElementById('ayahReference');
    if (data.ayah.url) {
      referenceElement.innerHTML = `<a href="${data.ayah.url}" target="_blank" class="reference-link">[${data.ayah.reference}]</a>`;
    } else {
      referenceElement.innerText = `[${data.ayah.reference}]`;
    }
    
    document.getElementById('ayahTafsir').innerText = data.tafsir;
  }

  try {
    const ayahData = await fetchAyahData();
    const ayah = await getNextAyah(ayahData);
    updateUI(ayah);
    initThemeSwitcher(); // Initialize theme switcher
  } catch (error) {
    console.error('Error displaying ayah:', error);
    updateUI(fallbackAyahData[0]);
    initThemeSwitcher(); // Initialize theme switcher even on error
  }
});
