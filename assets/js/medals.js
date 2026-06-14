/**
 * medals.js
 * Dynamically renders medal cards into #medalsGrid.
 *
 * INSTRUCTIONS:
 *   1. Put your rendered medal images in the img/ folder.
 *   2. Set the `image` field to the filename, e.g. "made_connections.png"
 *   3. Leave `image: null` to show a placeholder until you have the file ready.
 */
(function () {
    const MEDALS = [
        {
            image: 'img/New Beginnings Render.png',
            name:  'Began Something',
            desc:  'Starting is often the hardest part. You did it.',
        },
        {
            image: 'img/Mindfulness Render.png',
            name:  'Practiced Mindfulness',
            desc:  'You paused and paid attention to the moment.',
        },
        {
            image: 'img/Handled Difficulty Render.png',
            name:  'Handled Difficulty',
            desc:  'You faced something tough and got through it.',
        },
        {
            image: 'img/Created Something Render.png',
            name:  'Created Something',
            desc:  'You made something that didn\'t exist before.',
        }
    ];

    const grid = document.getElementById('medalsGrid');

    MEDALS.forEach(data => {
        const card = document.createElement('div');
        card.className = 'medal-card';

        const wrap = document.createElement('div');
        wrap.className = 'medal-img-wrap';

        if (data.image) {
            const img = document.createElement('img');
            img.src = data.image;
            img.alt = data.name;
            img.loading = 'lazy';
            wrap.appendChild(img);
        } else {
            const ph = document.createElement('div');
            ph.className = 'medal-placeholder';
            ph.innerHTML = `<div class="ph-emoji">🏅</div><div class="ph-hint">Image coming soon</div>`;
            wrap.appendChild(ph);
        }

        card.appendChild(wrap);

        const nm = document.createElement('div'); nm.className = 'medal-name';  nm.textContent = data.name;
        const ds = document.createElement('div'); ds.className = 'medal-desc';  ds.textContent = data.desc;

        card.appendChild(nm);
        card.appendChild(ds);
        grid.appendChild(card);
    });
})();
