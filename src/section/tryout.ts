import {sectionRegistry} from "@/section/section-registry";
import {qhtml} from "@/qhtml/qhtml";
import {html} from "lit";


sectionRegistry["#sec-uni-hero"] = (current: HTMLElement, features: Map<string, string>) => html`
    <div class="hero">
        <div class="hero__content">
            <h1 class="hero__title">Welcome to the Hero Section</h1>
            <p class="hero__description">This is a simple hero section with a title and description.</p>
            <a href="#" class="hero__button">Learn More</a>
        </div>
        <div class="hero__image">
            <img src="https://via.placeholder.com/400" alt="Hero Image" />
        </div>
    </div>
`;
