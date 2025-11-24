<script setup lang="ts">
import IconStats from "@/components/icons/IconStats.vue";
import IconQuery from "@/components/icons/IconQuery.vue";
import IconSearch from "@/components/icons/IconSearch.vue";
import IconBrowse from "@/components/icons/IconBrowse.vue";
import InfoText from "@/components/common/InfoText.vue";
import CitationItem from "@/components/common/CitationItem.vue";
import { useCitationsStore } from "@/stores/citations";

const store = useCitationsStore();
const citation = store.latest;
</script>

<template>
    <main class="container">
        <div class="page-header">
            <h1>
                antiSMASH database <small>Precomputed antiSMASH results and advanced queries</small>
            </h1>
        </div>
        <div class="main-menu">
            <div class="well">
                <RouterLink class="fake-button" to="/stats">
                    <h3><IconStats /> Statistics</h3>
                    about the secondary metabolites in our database
                </RouterLink>
            </div>
            <div class="well">
                <RouterLink class="fake-button" to="/query">
                    <h3><IconQuery /> Query</h3>
                    the database for secondary metabolite regions
                </RouterLink>
            </div>
            <div class="well">
                <RouterLink class="fake-button" to="/search">
                    <h3><IconSearch /> Search</h3>
                    the database using protein sequences
                </RouterLink>
            </div>
            <div class="well">
                <RouterLink class="fake-button" to="/browse">
                    <h3><IconBrowse /> Browse</h3>
                    the database by phylogeny
                </RouterLink>
            </div>
        </div>

        <InfoText />

        <p style="text-align: center">
            <strong class="well">This is the antiSMASH database version 5, last updated 2025-11-15.</strong>
        </p>
        <h4>To cite the antiSMASH database, please reference</h4>
        <CitationItem
            :title="citation.title"
            :authors="citation.authors"
            :journal="citation.journal"
            :year="citation.year"
            :doi="citation.doi"
        />
    </main>
</template>

<style scoped>
.page-header {
    padding-bottom: 8px;
    margin: 40px 0 20px;
}

.main-menu {
    display: flex;
    justify-content: space-evenly;
}
.well {
    flex-grow: 1;
    padding: 9px;
    background-image: linear-gradient(
        to bottom,
        var(--color-background-soft) 0,
        var(--color-background-mute) 100%
    );
    background-repeat: repeat-x;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1);
}

.fake-button {
    color: var(--color-text);
    text-decoration: none;
}
.fake-button:hover {
    text-decoration: none;
}
</style>
