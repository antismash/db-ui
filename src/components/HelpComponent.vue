<script setup lang="ts">
import { useCategoriesStore } from "@/stores/categories";
import TabArea from "./TabArea.vue";
import CustomTab from "./CustomTab.vue";
import CollapsibleContent from "./common/CollapsibleContent.vue";
import HelpFigure from "./common/HelpFigure.vue";

const store = useCategoriesStore();
await store.getCategories();
const categories = store.categories.getCategoriesByType("region");
</script>

<template>
    <h1>Help</h1>
    <div>
        <TabArea>
            <CustomTab title="Seach categories">
                <dl>
                    <template v-for="opt in categories?.options" :key="opt.label">
                        <dt>{{ opt.label }}</dt>
                        <dd>{{ opt.description }}</dd>
                    </template>
                    <template v-for="group in categories?.groups" :key="group.header">
                        <CollapsibleContent :title="group.header">
                            <dt>{{ group.header }}</dt>
                            <dd>
                                <dl>
                                    <template v-for="opt in group.options" :key="opt.label">
                                        <dt>{{ opt.label }}</dt>
                                        <dd>{{ opt.description }}</dd>
                                    </template>
                                </dl>
                            </dd>
                        </CollapsibleContent>
                    </template>
                </dl>
                <div class="error" v-if="store.error">
                    Could not load categories: {{ store.error }}
                </div>
            </CustomTab>
            <CustomTab title="Example use cases">
                <div class="use-case">
                    <CollapsibleContent title="Using the query builder">
                        <p>
                            In this example you will see how to use the query builder to find
                            nonribosomal peptide synthetase (NRPS) clusters that incorporate
                            hydroxyphenylglycine. First, open the "<em>Query</em>" page to access
                            the query builder (<strong>Figure 1</strong>).
                        </p>
                        <HelpFigure
                            src="/examples/nrps_search/01_query.png"
                            title="The query builder"
                            count="1"
                            class="float-around"
                        />
                        <p>
                            On the "<em>Select a category</em>" dropdown menu, pick the "<em
                                >BGC type</em
                            >" category. (<strong>Figure 2</strong>). Then, enter "<em>nrps</em>"
                            into the text box currently saying "<em>Please enter a value</em>".
                        </p>
                        <HelpFigure
                            src="/examples/nrps_search/02_select_type.png"
                            title="Select 'BGC type' category"
                            count="2"
                            class="float-around"
                        />
                        <p>
                            The current query will find all NRPS BGCs in the database. To restrict
                            the search to only BGCs that are predicted to incorporate
                            hydroxyphenylglycine, hit the "<em>Add term</em>" button (<strong
                                >Figure 3</strong
                            >).
                        </p>
                        <HelpFigure
                            src="/examples/nrps_search/03_add_term.png"
                            title="Add term button"
                            count="3"
                            class="float-around"
                        />
                        <p>
                            On the new term, select <em>Substrate</em> as category and enter
                            "<em>hydroxyphe</em>". At that point the autocompletion suggestions
                            should be specific enough, you might still need to scroll down a bit to
                            find it. Click on the "<em>4-hydroxyphenylglycine</em>" entry, and the
                            value field should now say "<em>hpg</em>" (<strong>Figure 4</strong>).
                        </p>
                        <HelpFigure
                            src="/examples/nrps_search/04_run_search.png"
                            title="Run search"
                            count="4"
                            class="float-around"
                        />
                        <p>
                            After hitting the "<em>Search</em>" button, after a short moment the
                            result list will be displayed (<strong>Figure 5</strong>).
                        </p>
                        <HelpFigure
                            src="/examples/nrps_search/05_results.png"
                            title="Result view"
                            count="5"
                            class="float-around"
                        />
                        <p>
                            To load more results, hit the "<em>Load more</em>" button at the end of
                            the search results (<strong>Figure 6</strong>).
                        </p>
                        <HelpFigure
                            src="/examples/nrps_search/06_load_more.png"
                            title="Load more"
                            count="6"
                            class="float-around"
                        />
                    </CollapsibleContent>
                </div>
                <div class="use-case">
                    <CollapsibleContent title="Using the protein sequence search">
                        <p>
                            In this example you will see how to use the protein sequence search to
                            find tryptophan 6-halogenase homologs in the antiSMASH database. After
                            obtaining a reference protein sequence, e.g. from the Tambromycin tbrB
                            homolog from MIBiG entry
                            <a
                                href="https://mibig.secondarymetabolites.org/repository/BGC0001368/index.html"
                                >BGC0001368</a
                            >, locus tag <code>IF33_RS0114770</code>, select "<em>Search</em>" on
                            the top navigation bar. On the search page, click "<em
                                >Search for protein sequences in annotated regions</em
                            >" to select the protein search. (<strong>Figure 1</strong>). In the
                            "<em>Name your search</em>" field, put an identifier for your search. In
                            the "<em>Protein sequence</em>" field, paste your protein sequence, then
                            hit the "<em>Search</em>" button.
                        </p>
                        <HelpFigure
                            src="/examples/prot_seq_search/01_trp6_search.png"
                            title="The protein search"
                            count="1"
                            class="float-around"
                        />
                        <p>
                            After hitting the "<em>Search</em>" button, you will be redirected to
                            the jobs page, where you can track the status of your submitted jobs.
                            Your protein search job should be running (like in
                            <strong>Figure 2</strong>).
                        </p>
                        <HelpFigure
                            src="/examples/prot_seq_search/02_job_running.png"
                            title="The protein search"
                            count="2"
                            class="float-around"
                        />
                        <p>
                            Once your search job is done, you can click its row on the job table to
                            open the results view (<strong>Figure 3</strong>). Results are shown in
                            a table, with the locus tag, identity %, and record ID of the database
                            hits given. The record ID is a link to the antiSMASH results for the BGC
                            region containing the hit.
                        </p>
                        <HelpFigure
                            src="/examples/prot_seq_search/03_results.png"
                            title="The protein search"
                            count="3"
                            class="float-around"
                        />
                    </CollapsibleContent>
                </div>
                <div class="use-case">
                    <CollapsibleContent title="Downloading sequences">
                        <p>
                            In this example you will see how to download NRPS/PKS domain sequences
                            from the antiSMASH database in amino acid FASTA format. Go to the
                            "<em>Query</em>" page using the top navigation bar. Switch the search
                            type to "<em>NRPS/PKS domain</em>" mode by clicking the respective
                            button above the query field. Set the return format to "<em>AA FASTA</em
                            >". In the category dropdown, select "<em>NRPS/PKS domain</em>", then
                            enter "<em>PKS_KS</em>" as the search term (<strong>Figure 1</strong>).
                        </p>
                        <HelpFigure
                            src="/examples/domain_download/01_domain_search.png"
                            title="The PKS/NRPS domain query"
                            count="1"
                            class="float-around"
                        />
                        <p>
                            After hitting the "<em>Download</em>" button, you will be redirected to
                            the job overview table, where your current "<em>storedquery</em>" job
                            should be running (<strong>Figure 2</strong>).
                        </p>
                        <HelpFigure
                            src="/examples/domain_download/02_job_running.png"
                            title="A running 'storedquery' job"
                            count="2"
                            class="float-around"
                        />
                        <p>
                            Once the job completes, clicking on its table row will make the download
                            link available (<strong>Figure 3</strong>).
                        </p>
                        <HelpFigure
                            src="/examples/domain_download/03_download_ready.png"
                            title="The download is ready"
                            count="3"
                            class="float-around"
                        />
                    </CollapsibleContent>
                </div>
            </CustomTab>
        </TabArea>
    </div>
</template>

<style scoped>
.use-case {
    display: flow-root;
}
.use-case p {
    color: var(--color-heading);
}
.float-around {
    padding: 2rem 0 0;
    margin: auto;
}
</style>
