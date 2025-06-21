
export enum IModifier {
    SKIP = "skip", // skp this node No Wrapping
    APPEND = "append" // Append to the element with the same I
}


export class ElementI {
    private n : number = 0;

    private mod : IModifier | null = null;

    constructor(n : string) {

        this.setNewN(n);
    }

    public setNewN(n : string) {
        n = n.toLowerCase().trim();

        if (n === "-") {
            this.mod = IModifier.SKIP;
            return;
        }
        if (n.startsWith("+")) {
            this.mod = IModifier.APPEND;
            n = n.substring(1);
        }

        this.n = parseInt((parseFloat(n) * 10) + "");
        if (isNaN(this.n)) {
            console.warn("ElementI: Invalid number", n);
            this.n = 0;
        }
    }

    /**
     * Return the index as full number (int) 10 - 65
     *
     *
     */
    public getNasInt() : number {
        return this.n;
    }

    public getNasString() : string {
        let v = "";
        if (this.mod === IModifier.SKIP)
            return "none";
        if (this.mod === IModifier.APPEND)
            v += "+";

        v += (this.n / 10).toFixed(1);
        return v;
    }


    public getModifier() : IModifier | null {
        return this.mod;
    }

}
