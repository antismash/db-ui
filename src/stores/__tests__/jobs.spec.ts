import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import {
    fetchErrorResponse,
    fetchInvalidJsonResponse,
    fetchJsonResponse,
    fetchEmptyResponse,
} from "../test_utils";

import { useJobsStore, JOB_URL_BASE } from "../jobs";
import { Job } from "@/models/jobs";

global.fetch = vi.fn();

const DATA = {
    id: "fake",
    next: "/api/job/fake",
    jobtype: "comparippson",
    status: "done",
    submitted: new Date().toString(),
    results: "This totally worked",
};

describe("Jobs Store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        // @ts-ignore
        global.fetch.mockReset();
    });

    it("starts with no jobs", () => {
        const store = useJobsStore();
        expect(store.jobs.length).toEqual(0);
    });

    describe("addJob", () => {
        it("adds a job", () => {
            const store = useJobsStore();
            const job = new Job("test", "/api/test", "clusterblast", "pending");
            store.addJob(job);
            expect(store.jobs.length).toEqual(1);
            expect(store.jobs[0]).toStrictEqual(job);
            expect(store._jobs.get("test")).toStrictEqual(job);
        });
    });
    describe("removeJob", () => {
        it("removes a job", async () => {
            const store = useJobsStore();
            const job = new Job("test", "/api/test", "clusterblast", "pending");
            store._jobs.set(job.id, job);
            expect(store.jobs.length).toEqual(1);
            // @ts-ignore
            fetch.mockResolvedValue(fetchEmptyResponse());
            await store.removeJob("test");
            expect(fetch).toHaveBeenCalledWith(`${JOB_URL_BASE}/test`, { method: "DELETE" });
            expect(store.jobs.length).toEqual(0);
        });
    });
    describe("getJob", () => {
        it("loads a local job if present", async () => {
            const store = useJobsStore();
            const job = new Job("test", "/api/test", "clusterblast", "pending");
            store._jobs.set(job.id, job);
            expect(await store.getJob("test")).toStrictEqual(job);
        });
        it("fetches a job from the server if possible", async () => {
            const store = useJobsStore();
            // @ts-ignore
            fetch.mockResolvedValue(fetchJsonResponse(DATA));
            const job = await store.getJob("fake");
            expect(fetch).toHaveBeenCalledWith(`${JOB_URL_BASE}/fake`);
            expect(job?.id).toBe("fake");
        });
        it("returns undefined if the fetch fails", async () => {
            const store = useJobsStore();
            // @ts-ignore
            fetch.mockResolvedValue(fetchErrorResponse("ruhroh"));
            const job = await store.getJob("fake");
            expect(fetch).toHaveBeenCalledWith(`${JOB_URL_BASE}/fake`);
            expect(job).toBeUndefined();
        });
        it("returns undefined if the JSON decoding fails", async () => {
            const store = useJobsStore();
            // @ts-ignore
            fetch.mockResolvedValue(fetchInvalidJsonResponse("ruhroh"));
            const job = await store.getJob("fake");
            expect(fetch).toHaveBeenCalledWith(`${JOB_URL_BASE}/fake`);
            expect(job).toBeUndefined();
        });
    });
    describe("update", () => {
        it("updates all jobs that have a nextUrl set", async () => {
            const store = useJobsStore();
            store.addJob(
                new Job("done-already", "", "comparippson", "done", undefined, "This worked")
            );
            store.addJob(new Job("fetch-me", "/api/job/fetch-me", "clusterblast", "running"));
            // @ts-ignore
            fetch.mockResolvedValue(
                fetchJsonResponse({ next: "", status: "done", results: "This worked as well" })
            );
            expect(store.jobs[1].status).toBe("running");
            await store.update();
            expect(fetch).toHaveBeenCalledOnce();
            expect(fetch).toHaveBeenCalledWith("/api/job/fetch-me");
            const updatedJob = await store.getJob("fetch-me");
            expect(updatedJob?.status).toBe("done");
        });
        it("sets the job status to failed when the fetch fails", async () => {
            const store = useJobsStore();
            store.addJob(new Job("fetch-me", "/api/job/fetch-me", "clusterblast", "running"));
            // @ts-ignore
            fetch.mockResolvedValue(fetchErrorResponse("ruhroh"));
            await store.update();
            expect(fetch).toHaveBeenCalledOnce();
            expect(fetch).toHaveBeenCalledWith("/api/job/fetch-me");
            const updatedJob = await store.getJob("fetch-me");
            expect(updatedJob?.status).toBe("failed");
            expect(updatedJob?.nextUrl).toBe("");
        });
        it("sets the job status to failed when the JSON decoding fails", async () => {
            const store = useJobsStore();
            store.addJob(new Job("fetch-me", "/api/job/fetch-me", "clusterblast", "running"));
            // @ts-ignore
            fetch.mockResolvedValue(fetchInvalidJsonResponse("ruhroh"));
            await store.update();
            expect(fetch).toHaveBeenCalledOnce();
            expect(fetch).toHaveBeenCalledWith("/api/job/fetch-me");
            const updatedJob = await store.getJob("fetch-me");
            expect(updatedJob?.status).toBe("failed");
            expect(updatedJob?.nextUrl).toBe("");
        });
        it("removes jobs older than seven days", async () => {
            const store = useJobsStore();
            // @ts-ignore
            fetch.mockResolvedValue(fetchEmptyResponse());
            const eightDaysAgo = new Date();
            eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
            store.addJob(new Job("delete-me", "", "storedquery", "done", eightDaysAgo));
            expect(store._jobs.size).toBe(1);
            await store.update();
            expect(store._jobs.size).toBe(0);
            expect(fetch).toHaveBeenCalledWith(`${JOB_URL_BASE}/delete-me`, { method: "DELETE" });
        });
    });
});
