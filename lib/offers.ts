import type { BankAccount, Pack } from "./types";

export function defaultPacks(): Pack[] {
  return [
    {
      id: "pack_videos",
      nom: "Pack vidéos",
      detail: "Toutes les vidéos du livre, leçon après leçon.",
      prixMad: 290,
      actif: true,
      duree: "",
      perimetre: "",
    },
    {
      id: "pack_complet",
      nom: "Pack complet",
      detail: "Toutes les vidéos et les PDF du livre.",
      prixMad: 490,
      actif: true,
      duree: "",
      perimetre: "",
    },
  ];
}

export function defaultBanks(): BankAccount[] {
  return [
    {
      id: "attijari",
      nom: "Attijariwafa bank",
      titulaire: "Le Livre Magique",
      rib: "007 000 0000000000000000 00",
      consigne: "Virement ou versement. Mets ton nom et ton numéro en motif.",
    },
    {
      id: "cih",
      nom: "CIH Bank",
      titulaire: "Le Livre Magique",
      rib: "230 000 0000000000000000 00",
      consigne: "Virement ou versement. Mets ton nom et ton numéro en motif.",
    },
    {
      id: "bmce",
      nom: "BMCE Bank of Africa",
      titulaire: "Le Livre Magique",
      rib: "011 000 0000000000000000 00",
      consigne: "Virement ou versement. Mets ton nom et ton numéro en motif.",
    },
    {
      id: "cashplus",
      nom: "Cash Plus",
      titulaire: "Le Livre Magique",
      rib: "06 61 00 00 00",
      consigne: "Envoie le montant sur ce numéro Cash Plus. Garde le reçu.",
    },
  ];
}

export function formatMad(amount: number) {
  return `${new Intl.NumberFormat("fr-MA").format(amount)} DH`;
}
