import { computed, ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { Job } from "@/models/jobs";
import { parse, stringify } from "superjson";

export const JOB_URL_BASE = "/api/v1.0/job";

export const useJobsStore = defineStore(
    "jobs",
    () => {
        const _jobs = ref<Map<string, Job>>(new Map());

        function addJob(job: Job) {
            _jobs.value.set(job.id, job);
        }

        async function getJob(jobId: string) {
            let job = _jobs.value.get(jobId);

            if (job === undefined) {
                const raw = await fetch(`${JOB_URL_BASE}/${jobId}`);
                if (!raw.ok) {
                    return undefined;
                }

                try {
                    const data = await raw.json();
                    job = new Job(
                        data.id,
                        data.next,
                        data.jobtype,
                        data.status,
                        new Date(data.submitted),
                        data.results
                    );
                    addJob(job);
                } catch (err) {
                    return undefined;
                }
            }

            return job;
        }

        function removeJob(jobId: string) {
            _jobs.value.delete(jobId);
        }

        async function update() {
            _jobs.value.forEach(async (job) => {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - 7);
                // for some reason superjson doesn't convert job.submitted back to a Date, so let's do it here
                if (new Date(job.submitted) < cutoff) {
                    removeJob(job.id);
                }

                if (!job.nextUrl) {
                    return;
                }
                const raw = await fetch(job.nextUrl);
                if (!raw.ok) {
                    job.status = "failed";
                    job.nextUrl = "";
                    return;
                }

                try {
                    const data = await raw.json();
                    job.load(data);
                } catch {
                    job.status = "failed";
                    job.nextUrl = "";
                }
            });
        }

        const jobs = computed(() => {
            return Array.from(_jobs.value.values());
        });

        return { jobs, update, addJob, getJob, removeJob, _jobs };
    },
    {
        persist: {
            serializer: {
                deserialize: parse,
                serialize: stringify,
            },
        },
    }
);

/* don't worry about coverage for this development feature */
/* c8 ignore next 3 */
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useJobsStore, import.meta.hot));
}
