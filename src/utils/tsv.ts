export const downloadTsv = (
	data: object[],
	filename: string,
	headers?: string[],
	separator?: string,
) => {
	if (!data || !data.length) {
		return;
	}
	if (separator === undefined) {
		separator = "\t";
	}

	const keys: string[] = Object.keys(data[0]);

	let columnHeaders: string[];

	if (headers) {
		columnHeaders = headers;
	} else {
		columnHeaders = keys;
	}

	const contentRows = data.map(dataItem => {
		return keys.map(key => {
			if (dataItem[key] === null || dataItem[key] === undefined) {
				return "";
			}
			return String(dataItem[key]).replace(/\t/g, " ");
		}).join(separator);
	});

	const tsvData = [columnHeaders.join(separator), ...contentRows].join("\n")

	const blob = new Blob([tsvData], { type: "text/csv;charset=utf-8" });
	const link = document.createElement("a");
	link.href = window.URL.createObjectURL(blob);
	link.download = filename;
	link.click();
};


