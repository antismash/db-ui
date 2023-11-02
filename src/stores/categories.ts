import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { Categories } from "@/models/categories";
import { useQueriesStore } from "./queries";

export const CATEGORIES_URL = "/api/available/categories";

class CategoriesWrapper {
    _queries_store: any;
    _categories: Map<string, Categories>;

    constructor() {
        this._queries_store = useQueriesStore();
        this._categories = new Map();
        this._categories.set("region", new Categories());
        this._categories.set("gene", new Categories());
        this._categories.set("domain", new Categories());
    }

    getCurrentCategorySet() {
        const search_type = this._queries_store.search_type;
        return this._categories.get(search_type);
    }

    get options() {
        const current = this.getCurrentCategorySet();
        return current?.options;
    }

    get groups() {
        const current = this.getCurrentCategorySet();
        return current?.groups;
    }

    getType(name: string) {
        const current = this.getCurrentCategorySet();
        return current?.getType(name);
    }

    getFilters(name: string) {
        const current = this.getCurrentCategorySet();

        return current?.getFilters(name) ?? [];
    }

    isCountable(name: string) {
        const current = this.getCurrentCategorySet();

        return current?.isCountable(name);
    }

    hasData() {
        let has_data = true;
        this._categories.forEach((category) => {
            if (!category.hasData()) {
                has_data = false;
            }
        });
        return has_data;
    }

    getCategoriesByType(search_type: string) {
        return this._categories.get(search_type);
    }

    async fetchCategories(force = false) {
        if (this.hasData() && !force) {
            // Don't re-init categories
            return;
        }

        const categoryResponse = await fetch(CATEGORIES_URL);
        if (!categoryResponse.ok) {
            throw new Error(categoryResponse.statusText);
        }
        const categoryData = await categoryResponse.json();
        this._categories.forEach((category, key) => {
            if (categoryData[key]) {
                category.loadFromJson(categoryData[key]);
            }
        });
    }
}

export const useCategoriesStore = defineStore("categories", () => {
    const categories = reactive(new CategoriesWrapper());

    const error = ref("");
    const status = ref("");

    async function getCategories(force = false) {
        status.value = "loading";
        try {
            await categories.fetchCategories(force);
        } catch (err: unknown) {
            error.value = `${err}`;
            status.value = "error";
            return;
        }
        status.value = "loaded";
    }

    return { categories, error, getCategories, status };
});
