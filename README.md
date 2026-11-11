# Le Livre Magique

Plateforme des vidéos de Maître Mohssine pour le livre de français, 1ʳᵉ année Bac. Cette version suit le cahier des charges du 9 novembre 2026 et tourne en démonstration dans le navigateur, sans Supabase ni Bunny : les règles (codes, aperçu, appareils, ventes, lots, QR) sont déjà en place.

Grok est ajouté comme super admin de démonstration, à côté de Maître Mohssine et de With Khalil Agency.

## Lancer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run build
```

## Accès de démonstration

| Qui | Identifiant | Mot de passe |
| --- | --- | --- |
| Yassine, compte activé | `0661234524` | `K7M4PX` |
| Librairie, première connexion | `LM-00418` | `R8TQ2H` |
| Déjà 2 appareils | `0661000099` | `DEVICE` |
| Grok, super admin | `grok` | `GROK47` |
| Khalil, super admin | `khalil` | `AGENCE1` |
| Maître Mohssine, super admin | `mohssine` | `MOHSSINE` |
| Admin ventes | `ventes` | `VENTES1` |

L’admin ventes crée des comptes, renvoie les accès et cherche un élève. Le super admin gère aussi les vidéos, les QR, les lots, les appareils, la désactivation et les autres admins.

Les données de démo restent dans le navigateur (`localStorage`). Le bouton « Réinitialiser la démo » de l’admin les reconstruit.

## Ce que le serveur ne fait pas

Le QR encode `https://livremagique.ma/v/{slug}?s=qr`, jamais l’adresse d’un fichier. `POST /api/playback` ne renvoie pas d’URL de vidéo : il attendra une clé Bunny pour signer une lecture courte, limitée au domaine. L’aperçu visiteur dure 30 secondes et vient d’un flux séparé.

Le lecteur affiché est une simulation (reprise, 90 %, watermark, aperçu). Les fichiers Bunny remplaceront l’image de titre dès que les variables d’environnement seront remplies.

## Variables

Voir `.env.example` : Supabase, Bunny Stream, WhatsApp Cloud API, Sentry, domaine. Tant qu’elles sont vides, l’application reste en démonstration. Le numéro de support `06 61 00 00 00` est provisoire.

## Déploiement

Préproduction et production séparées, sur Vercel ou équivalent. Le code, Supabase, Bunny, Vercel et Meta doivent être au nom du client. Avant l’imprimerie, figer le domaine et les adresses `/v/{slug}` : elles sont imprimées dans les QR.
