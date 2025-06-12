export class QueryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "QueryError";
    }
}

export class QueryTermError extends QueryError {
    constructor(message: string) {
        super(message);
        this.name = "QueryTermError";
    }
}

export class QueryFilter {
    name: string;
    operator: string;
    value: string | number;

    constructor(name: string, value: string | number = "", operator: string = "") {
        this.name = name;
        this.operator = operator;
        this.value = value;
    }

    toString() {
        if (!this.value) {
            // boolean filter
            return ` WITH [${this.name}]`;
        }
        if (!this.operator) {
            // text filter
            return ` WITH [${this.name}|${this.value}]`;
        }
        return ` WITH [${this.name}|${this.operator}:${this.value}]`;
    }
}

export function createFilter(data: any) {
    return new QueryFilter(data.name, data.value, data.operator);
}

export class ModuleStep {
    title: string;
    options: string[];
    alternatives: string[][];

    constructor(title: string, options?: string[], alternatives?: string[][]) {
        this.title = title;
        this.options = options ?? [];
        this.alternatives = alternatives ?? [];
    }

    removeDomain(altIdx: number, domainIdx: number) {
        const filtered = this.alternatives[altIdx].filter((_, idx) => domainIdx != idx);
        if (filtered.length == 0) {
            this.alternatives.splice(altIdx, 1);
            return;
        }
        this.alternatives[altIdx] = filtered;
    }

    toString(): string {
        const parts: string[] = [];

        this.alternatives.forEach((group) => {
            parts.push(
                group
                    .map((domain) => {
                        switch (domain) {
                            case "any":
                                return "?";
                            case "none":
                                return "0";
                            default:
                                return domain;
                        }
                    })
                    .join("+")
            );
        });
        return parts.join(",");
    }

    load(data: string) {
        this.alternatives.length = 0;
        const alts = data.split(",");
        alts.forEach((alternative) => {
            this.alternatives.push(
                alternative.split("+").map((domain) => {
                    switch (domain) {
                        case "?":
                            return "any";
                        case "0":
                            return "none";
                        default:
                            return domain;
                    }
                })
            );
        });
    }
}

const condensationOptions = [
    "Condensation",
    "Condensation_DCL",
    "Condensation_LCL",
    "Condensation_Starter",
    "Condensation_Dual",
    "Cglyc",
    "Heterocyclisation",
    "PKS_KS",
    "CAL_domain",
    "SAT",
];

const activationOptions = ["AMP-binding", "A-OX", "PKS_AT"];

const modificationOptions = [
    "MT",
    "PKS_KR",
    "PKS_DH",
    "PKS_DH2",
    "PKS_DHt",
    "PKS_ER",
    "Beta_elim_lyase",
    "LPG_synthase_C",
    "TauD",
];

const transportOptions = ["PCP", "ACP", "ACP_beta", "PP-binding", "PKS_PP"];

const finalisationOptions = ["cAT", "TD", "Thioesterase", "Epimerisation"];

const otherOptions = [
    "Trans-AT_docking",
    "ACPS",
    "Aminotran_1_2",
    "Aminotran_3",
    "Aminotran_4",
    "Aminotran_5",
    "B",
    "ECH",
    "F",
    "F",
    "FkbH",
    "GNAT",
    "Hal",
    "NAD_binding_4",
    "NRPS-COM_Cterm",
    "NRPS-COM_Nterm",
    "PKS_Docking_Cterm",
    "PKS_Docking_Nterm",
    "Polyketide_cyc",
    "Polyketide_cyc2",
    "PS",
    "PT",
    "TIGR01720",
    "TIGR02353",
    "X ",
];

export class QueryModuleTerm {
    steps: ModuleStep[];
    prefixes: string[] = ["S", "L", "M", "T", "F", "O"];

    constructor(serialised?: string) {
        this.steps = [
            new ModuleStep("Condensation", condensationOptions),
            new ModuleStep("Substrate activation", activationOptions),
            new ModuleStep("Modification", modificationOptions),
            new ModuleStep("Carrier protein", transportOptions),
            new ModuleStep("Epimerase/Finalisation", finalisationOptions),
            new ModuleStep("Other", otherOptions),
        ];

        if (!serialised) {
            return;
        }
        this.load(serialised);
    }

    load(serialised: string) {
        const steps = serialised.split("|");

        steps.forEach((step) => {
            const idx = this.prefixes.indexOf(step.charAt(0));
            if (idx < 0) {
                return;
            }
            this.steps[idx].load(step.slice(2));
        });
    }

    toString(): string {
        const parts: string[] = [];

        this.steps.forEach((step, idx) => {
            if (step.alternatives.length == 0) {
                return;
            }
            parts.push(`${this.prefixes[idx]}=${step.toString()}`);
        });

        return parts.join("|");
    }
}

export class QueryTerm {
    termType: string;

    // termType == "op"
    operation?: string = undefined;
    left?: QueryTerm = undefined;
    right?: QueryTerm = undefined;

    // termType == "expr"
    category: string = "";
    value: string | number | QueryModuleTerm = "";
    filters: QueryFilter[] = [];
    count: number = 1;

    constructor(termType: string) {
        if (!["expr", "op"].includes(termType)) {
            throw new QueryTermError(`Invalid termType ${termType}`);
        }
        this.termType = termType;
    }

    addTerm() {
        if (this.termType != "expr") {
            throw new QueryTermError("Can only call addTerm() on 'expr' termTypes");
        }

        this.termType = "op";
        this.operation = "AND";
        this.left = createExpr(this);
        this.right = new QueryTerm("expr");

        this.category = "";
        this.value = "";
        this.filters.length = 0;
        this.count = 1;
    }

    swapTerms() {
        const tmp = this.left;
        this.left = this.right;
        this.right = tmp;
    }

    removeLeft() {
        if (!this.right) {
            throw new QueryTermError("Can't remove left without a right term.");
        }
        if (this.right.termType == "expr") {
            this.termType = "expr";

            this.category = this.right.category;
            this.value = this.right.value;
            this.filters = this.right.filters;
            this.count = this.right.count;

            this.left = undefined;
            this.right = undefined;
            this.operation = undefined;
            return;
        }
        this.operation = this.right.operation;
        this.left = this.right.left;
        this.right = this.right.right;
    }

    removeRight() {
        if (!this.left) {
            throw new QueryTermError("Can't remove right without a left term.");
        }
        if (this.left.termType == "expr") {
            this.termType = "expr";

            this.category = this.left.category;
            this.value = this.left.value;
            this.filters = this.left.filters;
            this.count = this.left.count;

            this.left = undefined;
            this.right = undefined;
            this.operation = undefined;
            return;
        }
        this.operation = this.left.operation;
        this.right = this.left.right;
        this.left = this.left.left;
    }

    addFilter() {
        this.filters.push(new QueryFilter(""));
    }

    removeFilter(idx: number) {
        this.filters.splice(idx, 1);
    }

    toString() {
        if (this.termType == "op") {
            const left: string = this.left?.toString() ?? "";
            const right: string = this.right?.toString() ?? "";

            if (!left) {
                return right;
            }

            if (!right) {
                return left;
            }

            return `( ${left} ${this.operation} ${right} )`;
        }

        if (!this.category) {
            return "";
        }

        let ret = "";

        if (this.count > 1) {
            ret = `${this.count}*`;
        }

        if (!this.value) {
            return `${ret}{[${this.category}]}`;
        }
        if (this.filters.length < 1) {
            return `${ret}{[${this.category}|${this.value}]}`;
        }

        return `${ret}{[${this.category}|${this.value}]${this.filters.map((filter) =>
            filter.toString()
        )}}`;
    }

    toJson(): any {
        if (this.termType == "op") {
            return {
                termType: this.termType,
                operation: this.operation,
                left: this.left?.toJson(),
                right: this.right?.toJson(),
            };
        }

        return {
            termType: this.termType,
            category: this.category,
            value: this.value,
            filters: this.filters,
            count: this.count,
        };
    }

    load(data: any) {
        if (!["expr", "op"].includes(data.termType)) {
            throw new QueryTermError(`Invalid termType ${data.termType}`);
        }
        this.clear();
        this.termType = data.termType;

        if (this.termType == "op") {
            this.operation = data.operation;
            this.left = createQueryTerm(data.left);
            this.right = createQueryTerm(data.right);
            return;
        }
        this.category = data.category;
        this.value = data.value;
        this.filters = data.filters?.map((filter: any) => createFilter(filter)) ?? [];
        if (data.count) {
            this.count = data.count;
        }
    }

    clear() {
        this.termType = "expr";
        this.left = undefined;
        this.right = undefined;
        this.operation = undefined;
        this.category = "";
        this.filters.length = 0;
        this.value = "";
        this.count = 1;
    }
}

function createExpr(data: any) {
    const term = new QueryTerm("expr");
    term.category = data.category;
    term.value = data.value;
    term.filters = data.filters?.map((filter: any) => createFilter(filter)) ?? [];
    if (data.count) {
        term.count = data.count;
    }
    return term;
}

function createOp(data: any) {
    const term = new QueryTerm("op");
    term.left = createQueryTerm(data.left);
    term.right = createQueryTerm(data.right);
    term.operation = data.operation.toUpperCase();
    return term;
}

export function createQueryTerm(data: any) {
    switch (data.termType) {
        case "expr":
            return createExpr(data);
        case "op":
            return createOp(data);
        default:
            throw new QueryTermError(`Invalid termType ${data.termType}`);
    }
}

export type QueryState = "input" | "running" | "error" | "done";
