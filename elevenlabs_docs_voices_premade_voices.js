        // Function to fetch and load voice data
        async function fetchVoices() {
            try {
                const response = await fetch('https://raw.githubusercontent.com/s201817571/hosting/main/elevenlabs_docs_voices_premade_voices.json');
                const data = await response.json();
                return data.voices;
            } catch (error) {
                console.error('Error fetching voices:', error);
                return [];
            }
        }

        // Function to populate select options
        async function populateSelect() {
            const voices = await fetchVoices();
            const select = document.getElementById('voice-select');
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.voice_id;
                option.textContent = voice.name;
                select.appendChild(option);
            });
        }

        // Function to load voice information on selection
        async function loadVoiceInfo() {
            const voiceId = document.getElementById('voice-select').value;
            const voices = await fetchVoices();
            const selectedVoice = voices.find(voice => voice.voice_id === voiceId);

            if (selectedVoice) {
                document.getElementById('voice-id').textContent = selectedVoice.voice_id;
                document.getElementById('voice-name').textContent = selectedVoice.name;
                document.getElementById('voice-category').textContent = selectedVoice.category;

                // Clear previous table rows
                const tableBody = document.getElementById('labels-table-body');
                tableBody.innerHTML = '';

                // Populate labels table
                for (const label in selectedVoice.labels) {
                    const row = document.createElement('tr');
                    const labelCell = document.createElement('td');
                    const valueCell = document.createElement('td');

                    labelCell.textContent = label;
                    valueCell.textContent = selectedVoice.labels[label];

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    tableBody.appendChild(row);
                }

                document.getElementById('voice-preview').src = selectedVoice.preview_url;
            }
        }

        // Populate the select options on page load
        document.addEventListener('DOMContentLoaded', () => {
            populateSelect();
        });