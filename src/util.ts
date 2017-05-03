export default class TsUtil {
    static checkNestedObject(obj, keys: number[]) {
        for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i];

            if (!obj.hasOwnProperty(key)) {
                return false;
            }

            obj = obj[key];
        }

        return true;
    }

    static getNestedObject(obj, keys: number[]) {
        for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i];

            if (!obj.hasOwnProperty(key)) {
                obj[key] = {};
            }

            obj = obj[key];
        }

        return obj;
    }

    static removeNestedObject(obj, keys: number[]): boolean {
        if (keys.length === 0) {
            return false;
        }

        for (let i = 0, l = keys.length - 1; i < l; i++) {
            const key = keys[i];

            if (!obj.hasOwnProperty(key)) {
                return false;
            }

            obj = obj[key];
        }

        if (!obj.hasOwnProperty(keys[keys.length - 1])) {
            return false;
        }

        delete obj[keys[keys.length - 1]];

        return true;
    }

    static updateSubTable(subTable, tsSection): boolean {
        const versionNumber = tsSection.getVersionNumber();
        const lastSectionNumber = tsSection.getLastSectionNumber();

        if (Object.keys(subTable).length === 0 || versionNumber !== subTable.versionNumber) {
            subTable.versionNumber = versionNumber;
            subTable.lastSectionNumber = lastSectionNumber;
            subTable.sections = [];

            return true;
        }

        return false;
    }

    static updateSection(subTable, tsSection): boolean {
        const sectionNumber = tsSection.getSectionNumber();

        if (subTable.sections.includes(sectionNumber)) {
            return false;
        }

        subTable.sections.push(sectionNumber);

        return true;
    }

    static checkSections(subTable): boolean {
        return subTable.sections.length === subTable.lastSectionNumber + 1;
    }
}
