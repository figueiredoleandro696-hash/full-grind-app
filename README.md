# Full Grind

Plateforme d'accompagnement : suivi des élèves, paiements, activité, appels coach, classement et agent IA.

> Bienvenue chez Full Grind, ton espace pour te surpasser, tout en étant accompagné.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | L'application (une seule page, sans dépendance) |
| `supabase/schema.sql` | Base de données Supabase : tables, sécurité (RLS), classement, créneaux, stockage des preuves |
| `supabase/functions/welcome-email/index.ts` | Edge Function qui envoie l'e-mail de bienvenue avec le code d'inscription |

## Mise en place Supabase

1. Crée un projet Supabase et exécute `supabase/schema.sql` dans le SQL Editor.
2. Déploie la fonction `welcome-email` (Edge Functions, **Verify JWT désactivé**).
3. Ajoute les secrets `RESEND_API_KEY`, `MAIL_FROM` et `WEBHOOK_SECRET`.
4. Branche le trigger `notify_welcome` sur `public.profiles` (voir la section 10 de `schema.sql`).
5. Inscris-toi une première fois puis passe ton compte en coach :
   `update public.profiles set role = 'coach' where email = 'ton@email.fr';`

## Important

- `index.html` utilise les fonctions de la plateforme Claude (base partagée, agent IA, export CSV). Hors de cette plateforme (par exemple sur GitHub Pages), il fonctionne en **mode local** : les données restent dans le navigateur et ne sont pas partagées entre les élèves.
- Ne mets jamais de clé `service_role`, de clé Resend ou de secret dans ce dépôt.
