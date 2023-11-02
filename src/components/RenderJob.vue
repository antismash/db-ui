<script setup lang="ts">
import ClusterblastResults from "@/components/common/ClusterblastResults.vue";
import ComparippsonResults from "@/components/common/ComparippsonResults.vue";
import DialogView from "@/components/DialogView.vue";
import StoredQueryResult from "@/components/common/StoredQueryResult.vue";

import IconArrowLeft from "./icons/IconArrowLeft.vue";
import IconHelp from "@/components/icons/IconHelp.vue";
import IconTrash from "./icons/IconTrash.vue";
import IconSpinner from "./icons/IconSpinner.vue";

import { useJobsStore } from "@/stores/jobs";
import { Job, JobType } from "@/models/jobs";
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps<{
    jobId: string;
}>();

const store = useJobsStore();

const job = ref(await store.getJob(props.jobId));

function getDisplayType(job: Job) {
    switch (job.jobtype) {
        case JobType.CLUSTERBLAST:
            return ClusterblastResults;
        case JobType.COMPARIPPSON:
            return ComparippsonResults;
        case JobType.STOREDQUERY:
            return StoredQueryResult;
        default:
            return IconHelp;
    }
}

const deleteModalOpen = ref(false);
function deleteJob() {
    if (!job.value) {
        return;
    }
    if (job.value.status == "failed") {
        store.removeJob(job.value.id);
        router.push({ name: "jobs" });
    }

    if (job.value?.status != "done") {
        return;
    }
    deleteModalOpen.value = true;
}

function deleteJobConfirmed() {
    if (!job.value) {
        return;
    }
    store.removeJob(job.value.id);
    deleteModalOpen.value = false;
    router.push({ name: "jobs" });
}

let intervalId: ReturnType<typeof setInterval>;

onMounted(async () => {
    intervalId = setInterval(async () => {
        await store.update();
        job.value = await store.getJob(props.jobId);
    }, 1000);
});

onUnmounted(() => {
    clearInterval(intervalId);
});
</script>

<template>
    <div class="job-nav">
        <button @click="$router.push({ name: 'jobs' })"><IconArrowLeft /> Back to job list</button>
        <button v-if="job && ['done', 'failed'].includes(job.status)" @click="deleteJob">
            <IconTrash /> Remove job
        </button>
    </div>
    <div>
        <h1>
            Job {{ jobId }} <small>{{ job?.jobtype }}</small>
        </h1>
    </div>
    <div v-if="job">
        <component
            v-if="job.status == 'done' && job.jobtype != JobType.STOREDQUERY"
            :is="getDisplayType(job)"
            :hits="job.results.hits"
        />
        <component
            v-else-if="job.status == 'done' && job.jobtype == JobType.STOREDQUERY"
            :is="getDisplayType(job)"
            :filename="job.results"
        />
        <div v-else-if="job.status == 'failed'">Job failed: {{ job.results?.error }}</div>
        <div v-else>Job is still {{ job.status }}, please wait. <IconSpinner /></div>
    </div>
    <div v-else>Please select a valid job ID.</div>
    <DialogView :open="deleteModalOpen" class="dialog">
        <div>Do you really want to delete job {{ job?.id }}?</div>
        <div class="confirm_buttons">
            <button @click="deleteJobConfirmed">Yes</button>
            <button @click="deleteModalOpen = false">No</button>
        </div>
    </DialogView>
</template>

<style scoped>
.job-nav {
    display: flex;
    justify-content: space-between;
}
</style>
