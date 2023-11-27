<script setup lang="ts">
import IconBan from "@/components/icons/IconBan.vue";
import IconCheck from "@/components/icons/IconCheck.vue";
import IconSpinner from "@/components/icons/IconSpinner.vue";
import IconTrash from "@/components/icons/IconTrash.vue";
import DialogView from "@/components/DialogView.vue";

import { useJobsStore } from "@/stores/jobs";
import { Job } from "@/models/jobs";
import { onMounted, onUnmounted, ref } from "vue";

const store = useJobsStore();
const deleteModalOpen = ref(false);
const jobToDelete = ref<Job>();

function getIconType(job: Job) {
    switch (job.status) {
        case "done":
            return IconCheck;
        case "failed":
            return IconBan;
        default:
            return IconSpinner;
    }
}

function deleteJob(job: Job) {
    if (job.status == "failed") {
        store.removeJob(job.id);
    }

    if (job.status != "done") {
        return;
    }
    jobToDelete.value = job;
    deleteModalOpen.value = true;
}

function deleteJobConfirmed() {
    if (!jobToDelete.value) {
        return;
    }
    store.removeJob(jobToDelete.value.id);
    deleteModalOpen.value = false;
    jobToDelete.value = undefined;
}

function blockDelete(job: Job) {
    return ["running", "pending"].includes(job.status);
}

let intervalId: ReturnType<typeof setInterval>;

onMounted(async () => {
    intervalId = setInterval(async () => {
        await store.update();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(intervalId);
});
</script>

<template>
    <main class="container">
        <h1>Jobs</h1>
        <div class="tip">Jobs will be deleted after 7 days.</div>
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Job ID</th>
                        <th>Job Type</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        class="__job_link"
                        v-for="job in store.jobs"
                        :key="job.id"
                        @click="$router.push({ name: 'job', params: { jobid: job.id } })"
                    >
                        <td>{{ job.id }}</td>
                        <td>{{ job.jobtype }}</td>
                        <td><timeago :datetime="job.submitted" auto-update /></td>
                        <td :class="job.status">
                            <component :is="getIconType(job)" /> {{ job.status }}
                        </td>
                        <td>
                            <button @click.stop="deleteJob(job)" :disabled="blockDelete(job)">
                                <IconTrash />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
    <DialogView :open="deleteModalOpen" class="dialog">
        <div>Do you really want to delete job {{ jobToDelete?.id }}?</div>
        <div class="confirm_buttons">
            <button @click="deleteJobConfirmed">Yes</button>
            <button @click="deleteModalOpen = false">No</button>
        </div>
    </DialogView>
</template>

<style scoped>
.done {
    color: var(--color-ok);
}
.failed {
    color: var(--color-error);
}
.pending,
.running {
    color: var(--color-text);
}
.__job_link {
    cursor: pointer;
}
.tip {
    text-align: right;
}
</style>
