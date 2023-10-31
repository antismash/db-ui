import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useCitationsStore = defineStore("citations", () => {
    const citations = ref([
        {
            title: "The antiSMASH database version 4: additional genomes and BGCs, new sequence-based searches and more",
            authors: ["Kai Blin", "Simon Shaw", "Marnix H. Medema", "Tilmann Weber"],
            journal: "Nucleic Acids Research",
            year: 2023,
            doi: "10.1093/nar/gkad984",
        },
        {
            title: "The antiSMASH database version 3: increased taxonomic coverage and new query features for modular enzymes",
            authors: [
                "Kai Blin",
                "Simon Shaw",
                "Satria A. Kautsar",
                "Marnix H. Medema",
                "Tilmann Weber",
            ],
            journal: "Nucleic Acids Research",
            year: 2021,
            doi: "10.1093/nar/gkaa978",
        },
        {
            title: "The antiSMASH database version 2: a comprehensive resource on secondary metabolite biosynthetic gene clusters",
            authors: [
                "Kai Blin",
                "Victòria Pascal Andreu",
                "Emmanuel L C de los Santos",
                "Francesco Del Carratore",
                "Sang Yup Lee",
                "Marnix H. Medema",
                "Tilmann Weber",
            ],
            journal: "Nucleic Acids Research",
            year: 2019,
            doi: "10.1093/nar/gky1060",
        },
        {
            title: "The antiSMASH database, a comprehensive database of microbial secondary metabolite biosynthetic gene clusters",
            authors: [
                "Kai Blin",
                "Marnix H. Medema",
                "Renzo Kottmann",
                "Sang Yup Lee",
                "Tilmann Weber",
            ],
            journal: "Nucleic Acids Research",
            year: 2016,
            doi: "10.1093/nar/gkw960",
        },
    ]);

    const latest = computed(() => {
        return citations.value[0];
    });

    return { citations, latest };
});
