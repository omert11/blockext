import { describe, expect, test } from "@jest/globals";
import BlockeXt from "../src/index";
const get_blockX = (innerHTML: string) => {
    let html = document.createElement("div");
    html.innerHTML = innerHTML;
    return new BlockeXt(html);
};
describe("for tag", () => {
    test("empty loop", () => {
        const blockX = get_blockX(
            `
        <div bx-main>
            <div bx-for="this">
                <p></p>
            </div>
        </div>
        `
        );
        blockX.main_loop({});
        expect(blockX.el.querySelectorAll("p").length).toBe(1);
    });
    test("2 elements", () => {
        const blockX = get_blockX(
            `
        <div bx-main>
            <div bx-for="this">
                <p></p>
            </div>
        </div>
        `
        );
        blockX.main_loop([{}, {}]);
        expect(blockX.el.querySelectorAll("p").length).toBe(2);
    });
    test("3 elements with get-text", () => {
        const blockX = get_blockX(
            `
        <main bx-main>
            <div bx-for="this">
                <p bx-get-text="my_text"></p>
            </div>
        </main>
        `
        );
        blockX.main_loop([
            {
                my_text: "A",
            },
            {
                my_text: "B",
            },
            {
                my_text: "C",
            },
        ]);
        let elements = blockX.el.querySelectorAll("p");
        expect(elements.length).toBe(3);
        expect(elements[0].innerHTML).toBe("A");
        expect(elements[1].innerHTML).toBe("B");
        expect(elements[2].innerHTML).toBe("C");
    });
    test("Dimensional Loop", () => {
        const blockX = get_blockX(
            `
            <main bx-main>
                <div bx-for="this">
                    <p bx-get-text="my_text"></p>
                    <p bx-for="data" bx-show-is="my_text_2" bx-get-text="my_text_2" style="display: none" class="inner-p"></p>
                </div>
            </main>
        `
        );
        blockX.main_loop([
            {
                my_text: "A",
                data: [{}, { my_text_2: "E" }, {}],
            },
            {
                my_text: "B",
            },
            {
                my_text: "C",
            },
        ]);
        let elements = blockX.el.querySelectorAll("p");
        expect(elements.length).toBe(6);
        elements = blockX.el.querySelectorAll(".inner-p");
        expect(elements.length).toBe(3);
        expect(elements[0].style.display).toBe("none");
        expect(elements[1].style.display).not.toBe("none");
        expect(elements[1].innerHTML).toBe("E");
        expect(elements[2].style.display).toBe("none");
    });
});
