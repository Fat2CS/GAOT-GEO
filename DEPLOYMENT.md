# Guide de Déploiement GoatGeo

## Option 1 : GitHub + Vercel (Recommandé)

### Étape 1 : Préparer votre repo GitHub

1. Créez un compte GitHub si vous n'en avez pas : [github.com](https://github.com)
2. Créez un nouveau repo (repository) :
   - Cliquez sur le bouton "New" ou "+"
   - Donnez un nom au repo : `goatgeo` ou le nom de votre choix
   - Choisissez **Privé** si vous voulez garder le code privé
   - **NE PAS** cocher "Initialize with README" (déjà fait)
   - Cliquez sur "Create repository"

### Étape 2 : Pousser votre code sur GitHub

Ouvrez un terminal dans votre dossier de projet et exécutez ces commandes :

```bash
# Initialiser git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - GoatGeo app"

# Renommer la branche en main
git branch -M main

# Ajouter votre repo GitHub comme remote (remplacez URL par votre URL)
git remote add origin https://github.com/VOTRE-USERNAME/goatgeo.git

# Pousser le code
git push -u origin main
```

**Note:** Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub et `goatgeo` par le nom de votre repo.

### Étape 3 : Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Sign Up" et connectez-vous avec GitHub
3. Une fois connecté, cliquez sur "Add New Project"
4. Sélectionnez votre repo `goatgeo` dans la liste
5. Cliquez sur "Import"

### Étape 4 : Configurer les variables d'environnement

Avant de déployer, vous devez ajouter vos variables d'environnement :

1. Dans l'écran de configuration du projet, trouvez la section "Environment Variables"
2. Ajoutez ces variables (copiez depuis votre fichier `.env`) :

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

3. Cliquez sur "Add" pour chaque variable

### Étape 5 : Déployer

1. Cliquez sur "Deploy"
2. Attendez 2-3 minutes que le déploiement se termine
3. Une fois terminé, vous verrez votre site en ligne avec une URL comme : `https://goatgeo-xyz.vercel.app`

### Étape 6 : Configurer votre domaine personnalisé (Optionnel)

1. Dans le dashboard Vercel, allez dans "Settings" > "Domains"
2. Ajoutez votre domaine personnalisé (ex: `goatgeo.com`)
3. Suivez les instructions pour configurer les DNS

---

## Mettre à jour votre site

À chaque fois que vous voulez mettre à jour votre site :

```bash
# Faites vos modifications dans le code
# Puis :

git add .
git commit -m "Description de vos changements"
git push
```

Vercel détectera automatiquement le push et redéploiera votre site en 2-3 minutes !

---

## Explication du Backend (Supabase)

### Votre backend est déjà hébergé !

**Bonne nouvelle :** Vous n'avez rien à faire pour le backend. Voici pourquoi :

1. **Base de données** : Hébergée sur Supabase (cloud)
   - Tables : `profiles`, `ip_rate_limits`
   - Authentification : Gérée par Supabase Auth
   - Stockage sécurisé dans le cloud

2. **Edge Functions** : Déjà déployées sur Supabase
   - `analyze` : Analyse les articles (GEO Score)
   - `rewrite` : Réécrit les articles pour l'IA
   - `create-checkout` : Crée les sessions Stripe
   - `stripe-webhook` : Gère les paiements Stripe

3. **API OpenAI** : Appelée depuis les Edge Functions
   - Vos clés API sont stockées en sécurité sur Supabase
   - Pas besoin de les mettre dans votre code frontend

### Architecture de votre application

```
┌─────────────────┐
│  Vercel (Web)   │  ← Votre site web (HTML/CSS/JS)
│   Frontend      │     Accessible publiquement
└────────┬────────┘
         │
         ↓ (API Calls)
┌─────────────────┐
│    Supabase     │  ← Backend complet
│                 │
│  • Database     │  ← Données utilisateurs
│  • Auth         │  ← Connexion/Inscription
│  • Edge Funcs   │  ← Logique métier
│  • Storage      │  ← Fichiers (si besoin)
└────────┬────────┘
         │
         ↓ (AI Requests)
┌─────────────────┐
│  OpenAI API     │  ← Intelligence artificielle
└─────────────────┘
```

### Configuration Stripe pour la production

**Important :** Avant de recevoir des paiements réels :

1. **Passez en mode Live sur Stripe** :
   - Dashboard Stripe > Mode "Live" (en haut à droite)
   - Récupérez vos clés LIVE (pas les TEST)

2. **Mettez à jour les variables Supabase** :
   - Allez sur votre projet Supabase
   - Settings > Edge Functions > Secrets
   - Mettez à jour :
     - `STRIPE_SECRET_KEY` (clé LIVE)
     - `STRIPE_PRICE_ID` (ID du prix LIVE)
     - `STRIPE_WEBHOOK_SECRET` (secret du webhook LIVE)

3. **Configurez le webhook Stripe** :
   - Dashboard Stripe > Developers > Webhooks
   - Cliquez "Add endpoint"
   - URL : `https://[votre-projet].supabase.co/functions/v1/stripe-webhook`
   - Événements à écouter :
     - `checkout.session.completed`
     - `customer.subscription.deleted`
   - Copiez le "Signing secret" dans `STRIPE_WEBHOOK_SECRET`

---

## Où est stocké votre code ?

- **Code source** : GitHub (vous en êtes propriétaire)
- **Site web** : Vercel (deploy automatique depuis GitHub)
- **Backend** : Supabase (base de données + API)
- **Vous gardez le contrôle total** : Vous pouvez à tout moment :
  - Cloner votre repo GitHub
  - Déployer ailleurs (Netlify, VPS, etc.)
  - Exporter votre base de données Supabase
  - Changer de fournisseur

---

## Surveillance et monitoring

### Vercel
- Dashboard : Voir les déploiements, logs, analytics
- URL : [vercel.com/dashboard](https://vercel.com/dashboard)

### Supabase
- Dashboard : Voir la base de données, logs des fonctions, utilisateurs
- URL : [app.supabase.com](https://app.supabase.com)

### Stripe
- Dashboard : Voir les paiements, abonnements, clients
- URL : [dashboard.stripe.com](https://dashboard.stripe.com)

---

## Questions fréquentes

**Q: Mon site est-il sécurisé ?**
R: Oui ! HTTPS automatique, base de données sécurisée, clés API jamais exposées.

**Q: Ça coûte combien ?**
R:
- Vercel : GRATUIT pour sites personnels
- Supabase : GRATUIT jusqu'à 500 Mo de DB et 2 Go de bande passante
- Stripe : 2.9% + 0.30€ par transaction

**Q: Comment voir les logs si j'ai une erreur ?**
R:
- Vercel : Dashboard > Projet > Functions
- Supabase : Dashboard > Edge Functions > Logs

**Q: Je peux migrer mon site ailleurs plus tard ?**
R: Oui, tout votre code est sur GitHub. Vous pouvez déployer sur Netlify, un VPS, etc.

---

## Support

Si vous avez des questions :
- Vercel Docs : [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs : [supabase.com/docs](https://supabase.com/docs)
- Stripe Docs : [stripe.com/docs](https://stripe.com/docs)
