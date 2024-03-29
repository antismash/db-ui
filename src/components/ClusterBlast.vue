<script setup lang="ts">
import { ref, type Ref } from "vue";
import ClusterblastResults from "./common/ClusterblastResults.vue";
import { useJobsStore } from "@/stores/jobs";
import { Job } from "@/models/jobs";
import { useRouter } from "vue-router";

const store = useJobsStore();
const router = useRouter();
const state = ref("input");
const error = ref("");

const name = ref("");
const sequence = ref("");

const hits: Ref<any[]> = ref([]);

function loadExample() {
    name.value = "NisA";
    sequence.value = "ITSISLCTPGCKTGALMGCNMKTATCHCSIHVSK";
}

function searchInvalid() {
    return !(name.value && sequence.value);
}

async function runSearch() {
    state.value = "searching";

    let request = {
        name: name.value,
        sequence: sequence.value,
    };

    let result = await fetch("/api/v1.0/clusterblast", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!result.ok) {
        state.value = "error";
        error.value = `Network request returned ${result.status}:${result.statusText}`;
        return;
    }

    let jobInfo = await result.json();
    const job = new Job(jobInfo.id, jobInfo.next, jobInfo.jobtype, jobInfo.status, undefined);
    store.addJob(job);
    router.push({ name: "jobs" });
}

function newSearch() {
    state.value = "input";
    name.value = "";
    sequence.value = "";
    hits.value.length = 0;
}
</script>

<template>
    <div v-show="state == 'input'">
        <div class="form">
            <label for="search-name">Name your search</label>
            <input
                id="search-name"
                class="expression"
                type="text"
                placeholder="query id"
                v-model="name"
            />

            <label for="search-seq">Protein sequence</label>
            <textarea
                id="search-seq"
                class="expression"
                maxlength="1000"
                placeholder="ITSISLCTPGCK..."
                v-model="sequence"
            ></textarea>
        </div>
        <div class="button-group">
            <button class="search btn-primary" @click="runSearch" :disabled="searchInvalid()">
                Search
            </button>
            <button class="example" @click="loadExample">Load example</button>
        </div>
    </div>
    <div v-show="state == 'searching'">Running search, please wait...</div>
    <div v-show="state == 'done'">
        <ClusterblastResults :hits="hits" />
        <div class="button-group">
            <button class="search btn-primary" @click="newSearch">New search</button>
        </div>
    </div>
</template>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
}
.form label {
    margin: 0.5em 0 0.25em 0;
    color: var(--color-text);
    font-weight: bold;
}
.form-control {
    text-align: right;
    margin-bottom: 0;
    padding-top: 7px;
    padding-right: 0.5em;
    font-weight: bold;
}
.expression {
    width: 80%;
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
</style>
