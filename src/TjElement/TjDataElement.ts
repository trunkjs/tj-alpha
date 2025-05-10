import {ReactiveElement} from "lit";
import {ElementDefinition} from "@/tools/build-element";


export class TjDataElement<TElementDefinition extends ElementDefinition<any, any, any>> extends ReactiveElement {


    //protected definition: TElementDefinition;

    constructor(definition?: TElementDefinition) {
        super();
       // this.definition = definition || {} as TElementDefinition;
    }

}
