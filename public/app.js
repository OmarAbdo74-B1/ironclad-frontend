import { formatPrice, formatSpecs, safeImageUrl, environmentLabel, categories } from './lib.js';

const grid = document.getElementById('car-grid');
const statusEl = document.getElementById('status');
const envEl = document.getElementById('env-badge');
const versionEl = document.getElementById('version');
const podEl = document.getElementById('pod');
const filterEl = document.getElementById('category-filter');

let allCars = [];

function createCard(car) {
  const card = document.createElement('article');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = safeImageUrl(car.image);
  img.alt = car.name;
  img.loading = 'lazy';

  const body = document.createElement('div');
  body.className = 'card-body';

  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = car.category;

  const name = document.createElement('h2');
  name.textContent = car.name;

  const specs = document.createElement('p');
  specs.className = 'specs';
  specs.textContent = formatSpecs(car);

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = formatPrice(car.priceUsd);

  body.append(category, name, specs, price);
  card.append(img, body);
  return card;
}

function render(cars) {
  grid.replaceChildren(...cars.map(createCard));
  statusEl.textContent = `${cars.length} cars`;
}

function fillFilter(cars) {
  for (const c of categories(cars)) {
    const option = document.createElement('option');
    option.value = c;
    option.textContent = c;
    filterEl.append(option);
  }
  filterEl.addEventListener('change', () => {
    const value = filterEl.value;
    render(value ? allCars.filter((car) => car.category === value) : allCars);
  });
}

async function loadInfo() {
  try {
    const res = await fetch('/api/info');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const info = await res.json();
    envEl.textContent = environmentLabel(info.environment);
    envEl.dataset.env = info.environment;
    versionEl.textContent = info.version;
    podEl.textContent = info.pod;
  } catch {
    envEl.textContent = 'API unreachable';
    envEl.dataset.env = 'error';
  }
}

async function loadCars() {
  try {
    const res = await fetch('/api/cars');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allCars = data.cars;
    fillFilter(allCars);
    render(allCars);
  } catch (err) {
    statusEl.textContent = `Could not load cars (${err.message})`;
  }
}

loadInfo();
loadCars();
