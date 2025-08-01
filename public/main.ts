import "./test.scss";
import {css, html, unsafeCSS} from "lit";
import {TjResponsive} from "../src/responsive/responsive";
export {ContentAreaElement} from "../src/content-area/ContentAreaElement";
export {ContentAreaElement2} from "../src/content-area2/ContentAreaElement2";
export {TjResponsive} from "../src/responsive/responsive";



(new TjResponsive()).observe(document);

