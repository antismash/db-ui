<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import ResultsList from "./common/ResultsList.vue";
import QueryTerm from "./QueryTerm.vue";
import { useQueriesStore } from "@/stores/queries";
import IconAdd from "./icons/IconAdd.vue";

const store = useQueriesStore();
const route = useRoute();
const router = useRouter();

const term_string = route.query.terms;
if (typeof term_string == "string") {
    await store.convertSearch(term_string);
}

const searchValid = computed(() => {
    return store.term.toString() !== "";
});

const showLoadMore = computed(() => {
    if (store.loadingMore || store.results.length >= store.total) {
        return false;
    }
    return true;
});

const isSearchJob = computed(() => {
    if (store.search_type != "region") {
        return true;
    }
    if (store.return_type != "json") {
        return true;
    }
    return false;
});

function clearSearch() {
    store.clearSearch();
    router.replace({ query: undefined });
}

function editSearch() {
    store.state = "input";
    store.offset = 0;
}

function changeSearchType(type: string) {
    store.search_type = type;
    switch (type) {
        case "region":
            if (store.return_type == "fastaa") {
                store.return_type = "json";
            }
            break;
        case "gene":
        case "domain":
            if (store.return_type == "fasta" || store.return_type == "genbank") {
                store.return_type = "fastaa";
            }
            break;
    }
}
</script>

<template>
    <h1>Query</h1>
    <div class="query-buttons">
        <button @click="editSearch" v-show="store.state != 'input'">Edit Search</button>
        <button @click="clearSearch">Clear Search</button>
    </div>
    <div class="pattern-list" v-if="store.state == 'input'">
        <div class="query-settings">
            <div class="search-options">
                <label>Search:</label>
                <div class="btn-group">
                    <label
                        class="btn btn-info"
                        :class="store.search_type == 'region' ? 'active' : ''"
                        @click="changeSearchType('region')"
                        >Region</label
                    >
                    <label
                        class="btn btn-info"
                        :class="store.search_type == 'gene' ? 'active' : ''"
                        @click="changeSearchType('gene')"
                        >Gene</label
                    >
                    <label
                        class="btn btn-info"
                        :class="store.search_type == 'domain' ? 'active' : ''"
                        @click="changeSearchType('domain')"
                        >NRPS/PKS domain</label
                    >
                </div>
            </div>
            <div class="return-options">
                <label>Return data in format:</label>
                <div class="btn-group">
                    <label
                        class="btn btn-info"
                        :class="store.return_type == 'json' ? 'active' : ''"
                        @click="store.return_type = 'json'"
                        >JSON</label
                    >
                    <label
                        class="btn btn-info"
                        :class="store.return_type == 'csv' ? 'active' : ''"
                        @click="store.return_type = 'csv'"
                        >CSV</label
                    >
                    <label
                        v-if="!['gene', 'domain'].includes(store.search_type)"
                        class="btn btn-info"
                        :class="store.return_type == 'fasta' ? 'active' : ''"
                        @click="store.return_type = 'fasta'"
                        >DNA FASTA</label
                    >
                    <label
                        v-if="store.search_type != 'region'"
                        class="btn btn-info"
                        :class="store.return_type == 'fastaa' ? 'active' : ''"
                        @click="store.return_type = 'fastaa'"
                        >AA FASTA</label
                    >
                    <label
                        v-if="!['gene', 'domain'].includes(store.search_type)"
                        class="btn btn-info"
                        :class="store.return_type == 'genbank' ? 'active' : ''"
                        @click="store.return_type = 'genbank'"
                        >GenBank</label
                    >
                </div>
            </div>
        </div>
        <QueryTerm v-model="store.term" />
        <div>
            {{ store.term.toString() }}
        </div>
        <div class="button-group">
            <button
                class="search btn-primary"
                @click="store.runSearch"
                :disabled="!searchValid"
                v-if="!isSearchJob"
            >
                Search
            </button>
            <button
                class="search btn-primary"
                @click="store.runDownload"
                :disabled="!searchValid"
                v-else
            >
                Download
            </button>
            <button class="example" @click="store.loadExample">Load example</button>
        </div>
    </div>
    <div v-if="store.state == 'running'">Running search, please wait...</div>
    <div v-if="store.state == 'error'">Some error happened: {{ store.error }}</div>
    <div v-if="store.state == 'done'">
        <div class="stats" v-if="store.results.length > 0">
            Your search gave <strong>{{ store.total }}</strong> results, showing
            <strong>1</strong> to <strong>{{ store.results.length }}</strong>
        </div>
        <ResultsList :results="store.results" />
        <div class="more-results" v-show="showLoadMore">
            <button class="btn-primary" @click="store.loadMore">
                <IconAdd /> Load more results
            </button>
        </div>
        <div class="loading-more" v-show="store.loadingMore">
            Loading more results, please wait...
        </div>
    </div>
</template>

<style scoped>
.pattern-list {
    margin: 1em 0;
    padding: 2em 1em;
    border-radius: 8px;
    border: 1px dashed #444;
}
.button-group {
    display: flex;
    justify-content: flex-end;
    margin-top: 2em;
}
.search {
    width: 25%;
}
.example {
    margin-left: 25%;
}

.query-buttons {
    display: flex;
    justify-content: flex-end;
}

.query-settings {
    display: flex;
    justify-content: space-around;
    padding-bottom: 1rem;
}
.query-settings > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.query-settings > div > label {
    padding-right: 0.5rem;
}
.btn-info {
    color: white;
    background-color: var(--color-info);
    background-image: none;
}
.btn-info.active {
    background-color: var(--as-c-darkblue);
}
</style>
