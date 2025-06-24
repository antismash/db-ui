<script setup lang="ts">
const props = defineProps<{
    results: any[];
}>();

function showRegion(region: any) {
    window.open(
        `/output/${region.assembly_id}/index.html#r${region.record_number}c${region.region_number}`,
        "_blank"
    );
}

function getNcbiLink(region: any) {
    return `https://www.ncbi.nlm.nih.gov/nucleotide/?term=${region.acc}`;
}

function getMibigLink(region: any) {
    return `https://mibig.secondarymetabolites.org/go/${region.best_mibig_hit_acc}`;
}

function getRegionClass(region: any) {
    let classes: string[] = ["badge", "secmet"];
    if (region.term.includes(" hybrid")) {
        classes.push("hybrid");
    } else {
        classes.push(region.term);
    }
    classes.push(region.category);
    return classes;
}

function getCbhStyle(region: any) {
    let color = "rgba(205, 92, 92, 0.3)";

    if (region.best_mibig_hit_similarity > 75) {
        color = "rgba(0, 100, 0, 0.3)";
    } else if (region.best_mibig_hit_similarity > 50) {
        color = "rgba(210, 105, 30, 0.3)";
    }

    return `background-image: linear-gradient(to left, ${color}, ${color} ${region.best_mibig_hit_similarity}%, #ffffff00 ${region.best_mibig_hit_similarity}%)`;
}

function getSimilarityLevel(region: any) {
    if (region.best_mibig_hit_similarity > 75) {
        return "High";
    } else if (region.best_mibig_hit_similarity > 50) {
        return "Medium";
    } else {
        return "Low";
    }
}
</script>

<template>
    <table v-if="props.results.length > 0">
        <thead>
            <tr>
                <th>Species</th>
                <th>Region</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Edge</th>
                <th>Similarity confidence</th>
                <th>Most similar MIBiG cluster</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="(region, index) in props.results"
                :key="index"
                class="cluster-list"
                @click="showRegion(region)"
            >
                <td>
                    <a :href="getNcbiLink(region)" class="link-external"
                        >{{ region.genus }} {{ region.species }} {{ region.strain }}</a
                    >
                </td>
                <td>
                    <span :class="getRegionClass(region)"
                        >{{ region.record_number }}.{{ region.region_number }}</span
                    >
                </td>
                <td>{{ region.description }}</td>
                <td class="digits">{{ region.start_pos }}</td>
                <td class="digits">{{ region.end_pos }}</td>
                <td>{{ region.contig_edge ? "Yes" : "No" }}</td>
                <template v-if="region.best_mibig_hit_acc">
                    <td class="digits" :style="getCbhStyle(region)">
                        {{ getSimilarityLevel(region) }}
                    </td>
                    <td>
                        <a :href="getMibigLink(region)" class="link-external">
                        {{ region.best_mibig_hit_description }}
                        ({{ region.best_mibig_hit_acc }})
                        </a>
                    </td>
                </template>
                <template v-else>
                    <td></td>
                    <td></td>
                    <td></td>
                </template>
            </tr>
        </tbody>
    </table>
    <div v-else>Your search gave no results. Please change your search terms and try again.</div>
</template>

<style scoped>
.badge {
    display: block;
    float: right;
    min-width: 10px;
    padding: 3px 7px;
    font-weight: bold;
    font-size: 12px;
    text-align: center;
    border-radius: 10px;
}

.link-external::after {
    display: inline-block;
    content: " ";
    background: url("/src/assets/link.svg") no-repeat;
    width: 1em;
    height: 1em;
    margin-left: 5px;
}
</style>
