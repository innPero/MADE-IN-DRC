const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const KEY = 'made-in-drc.demo.v1';

function buildSandbox({ hash = '#/', storage = {} } = {}) {
  const store = new Map(Object.entries(storage));
  const windowListeners = new Map();
  const documentListeners = new Map();

  const navigation = { classList: classList() };
  const menuToggle = { setAttribute() {} };
  const toast = { textContent: '', style: { display: 'none' } };
  const chatInput = { focus() {} };
  const main = {
    innerHTML: '',
    focus() {},
    querySelector(selector) {
      if (selector !== 'h1') return null;
      const match = this.innerHTML.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (!match) return null;
      return { textContent: stripTags(match[1]).trim() };
    }
  };
  const dialog = {
    open: false,
    innerHTML: '',
    showModal() { this.open = true; },
    close() { this.open = false; },
    querySelector() { return { focus() {} }; }
  };

  const document = {
    title: '',
    querySelector(selector) {
      if (selector === '#main') return main;
      if (selector === '#contact-dialog') return dialog;
      if (selector === '#toast') return toast;
      if (selector === '#navigation') return navigation;
      if (selector === '.menu-toggle') return menuToggle;
      if (selector === '#chat-form input') return chatInput;
      if (selector === '.chat-log') return null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-nav]') return [];
      return [];
    },
    addEventListener(type, listener) {
      documentListeners.set(type, listener);
    },
    createElement() {
      return { click() {}, set href(_) {}, set download(_) {} };
    }
  };

  const location = { hash };
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };

  const context = {
    window: {
      addEventListener(type, listener) { windowListeners.set(type, listener); },
      scrollTo() {}
    },
    document,
    location,
    localStorage,
    URLSearchParams,
    Intl,
    Date,
    Math,
    String,
    Number,
    JSON,
    setTimeout,
    clearTimeout,
    confirm: () => true,
    console,
    Blob,
    URL: {
      createObjectURL: () => 'blob:test',
      revokeObjectURL: () => {}
    }
  };

  context.window.location = location;
  context.globalThis = context;

  const vmContext = vm.createContext(context);
  runScript(vmContext, 'data.js');
  runScript(vmContext, 'app.js');

  return {
    main,
    location,
    triggerHashchange() {
      windowListeners.get('hashchange')?.();
    }
  };
}

function runScript(context, file) {
  const filePath = path.join(__dirname, '..', file);
  const source = fs.readFileSync(filePath, 'utf8');
  new vm.Script(source, { filename: filePath }).runInContext(context);
}

function stripTags(text) {
  return text.replace(/<[^>]+>/g, '');
}

function classList() {
  const values = new Set();
  return {
    add(v) { values.add(v); },
    remove(v) { values.delete(v); },
    toggle(v) { if (values.has(v)) { values.delete(v); return false; } values.add(v); return true; }
  };
}

function route(app, hash) {
  app.location.hash = hash;
  app.triggerHashchange();
}

test('accueil affiché au démarrage', () => {
  const app = buildSandbox();
  assert.match(app.main.innerHTML, /Le Congo crée\./);
});

test('recherche catalogue sans accents', () => {
  const app = buildSandbox();
  route(app, '#/catalogue?q=cafe');
  assert.match(app.main.innerHTML, /Café arabica des hauts plateaux/);
});

test('tri par prix place cacao avant café', () => {
  const app = buildSandbox();
  route(app, '#/catalogue?sort=price');
  const cacaoIndex = app.main.innerHTML.indexOf('Fèves de cacao séchées');
  const cafeIndex = app.main.innerHTML.indexOf('Café arabica des hauts plateaux');
  assert.ok(cacaoIndex >= 0);
  assert.ok(cafeIndex >= 0);
  assert.ok(cacaoIndex < cafeIndex);
});

test('route inconnue retourne la page introuvable', () => {
  const app = buildSandbox();
  route(app, '#/inconnu');
  assert.match(app.main.innerHTML, /Cette page est introuvable/);
});

test('filtre partenaires par service, région et statut vérifié', () => {
  const app = buildSandbox();
  route(app, '#/partenaires?service=Transport+a%C3%A9rien&region=Europe&verified=on');
  assert.match(app.main.innerHTML, /Partenaire aérien B/);
  assert.doesNotMatch(app.main.innerHTML, /Partenaire routier D/);
});

test('assistant contextualisé sur une offre', () => {
  const app = buildSandbox();
  route(app, '#/assistant?product=design');
  assert.match(app.main.innerHTML, /Vous consultez « Identité visuelle pour votre marque »/);
});

test('espace vendeur sans profil affiche le formulaire de création', () => {
  const app = buildSandbox();
  route(app, '#/espace');
  assert.match(app.main.innerHTML, /Créer ma vitrine de démonstration/);
});

test('profil stocké est rechargé dans l’espace vendeur', () => {
  const app = buildSandbox({
    storage: {
      [KEY]: JSON.stringify({
        version: 1,
        profile: {
          name: 'Atelier Demo',
          city: 'Goma',
          category: 'Services',
          about: 'Profil de test',
          email: 'vendeur@example.com',
          phone: ''
        },
        products: [],
        requests: [],
        chat: []
      })
    }
  });
  route(app, '#/espace');
  assert.match(app.main.innerHTML, /Atelier Demo/);
});

test('stockage corrompu retombe sur un état vide', () => {
  const app = buildSandbox({
    storage: {
      [KEY]: '{"version":1,'
    }
  });
  route(app, '#/espace');
  assert.match(app.main.innerHTML, /Créer ma vitrine de démonstration/);
});
