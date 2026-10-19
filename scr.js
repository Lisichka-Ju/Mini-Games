// ====== СПИСОК ВСЕХ РАБОТ ======
// Чтобы добавить новую — допиши объект в конец массива.
const works = [
    {
        href: '../Mini-Games/3/index.html',
        img: '../Mini-Games/img/kub.png',
        title: 'Kub',
        text: 'Это модель куба, которую можно вращать на 360 градусов. Управляется стрелками на клавиатуре.'
    },
    {
        href: '../Mini-Games/2/index.html',
        img: '../Mini-Games/img/layer-1.jpg',
        title: 'Les Tropyki',
        text: 'Это адаптативный сайт с паралакс эффектом. Управление мышкой.'
    },
    {
        href: '../Mini-Games/1/convas.html',
        img: '../Mini-Games/img/effect1.png',
        title: 'Convas',
        text: 'Это мини игра написанная с помощью js. Управление мышкой и нажатием правой кнопки мыши.'
    },
    {
        href: '../Mini-Games/4/index.html',
        img: '../Mini-Games/img/deva.png',
        title: 'Deva',
        text: 'Это адаптивный сайт со скролом. Управление мышкой колёсико мышки.'
    },
    {
        href: '../Mini-Games/5/index.html',
        img: '../Mini-Games/img/4.jpg',
        title: 'Mount',
        text: 'Это адаптивный сайт со скролом. Управление мышкой колёсико мышки. Если нажать на иконку в нижнем левом углу, появится музыка.'
    },
    {
        href: '../Mini-Games/6/stardust.html',
        img: '../Mini-Games/img/1.png',
        title: 'Stardust',
        text: 'Это мини игра написанная с помощью js. Управление мышкой. Навести мышку на сферу.'
    },
    {
        href: '../Mini-Games/7/index.html',
        img: '../Mini-Games/img/7.png',
        title: 'Particles',
        text: 'Это мини игра написанная с помощью js. Управление мышкой. При двойном клике частицы меняют форму.'
    },
    {
        href: '../Mini-Games/8/index.html',
        img: '../Mini-Games/img/8.png',
        title: '3D Object',
        text: 'Это мини игра написанная с помощью js. Управление мышкой.'
    }
];
// ==============================


const container = document.getElementById('works');
const button = document.getElementById('more');
let shown = 0;

// Показать следующие 6 работ (или сколько осталось)
function show() {
    const part = works.slice(shown, shown + 6);
    if (part.length === 0) return;

    // Разбиваем на секции по 3
    let html = '';
    for (let i = 0; i < part.length; i += 3) {
        const row = part.slice(i, i + 3).map(w => `
            <div class="blog__item">
                <div class="blog__header">
                    <a href="${w.href}"><img class="blog__photo" src="${w.img}" alt="${w.title}"></a>
                </div>
                <div class="blog__content">
                    <div class="blog__title"><a href="${w.href}">${w.title}</a></div>
                    <div class="blog__text">${w.text}</div>
                </div>
            </div>
        `).join('');

        html += `
            <section class="section">
                <div class="container">
                    <div class="blog">${row}</div>
                </div>
            </section>
        `;
    }

    container.insertAdjacentHTML('beforeend', html);
    shown += part.length;

    // Если работы закончились — прячем кнопку
    if (shown >= works.length) button.style.display = 'none';
}

// Старт + клик
show();
button.addEventListener('click', show);
