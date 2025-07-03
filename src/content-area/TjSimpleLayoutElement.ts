import {LitElement} from "lit";
import {arrangeSlots} from "./slot-maschine";


export class TjSimpleLayoutElement extends LitElement {
  firstUpdated() {
    // Important: Arrange the slots after the first render.
    arrangeSlots(this); // Important: Will assign gthe slot names to the children
  }
}
