import { TagType } from "./enums";
import { factoryFunction, tagFactory } from "./factory";
import { IBlockeXt, loopFunction } from "./interfaces";
function createElementFromHTML(htmlString: string) {
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild as HTMLElement;
}
const tag_registry: Array<factoryFunction> = [];

const registry = {
    get registry() {
        return [...tag_registry];
    },
    add(tag: factoryFunction) {
        tag_registry.push(tag);
    },
    get_tag_methods(arr: Array<string>) {
        return registry.registry.filter((fF) => arr.includes(fF._name));
    },
};

// For Tag
const FOR_TAG = tagFactory({
    name: "for",
    type: TagType.each,
    use() {
        this.add_context("base_attr", this.attr);
        let loop_data = this.data;
        if (!loop_data) loop_data = [];
        else if (!Array.isArray(loop_data)) loop_data = [loop_data];
        this.remove_tag_attribute();
        this.el.setAttribute("bx-each-id", this.id.toString());
        const loop_html = this.el.outerHTML;
        this.add_context("loop_html", loop_html);
        return {
            break_loop: false,
            context: null,
            each_method(el: HTMLElement, context: any, loop_method: loopFunction, BX: IBlockeXt) {
                for (let i = 0; i < loop_data.length; i++) {
                    let each_context = {
                        ...loop_data[i],
                        "bx-for-counter": i + 1,
                        "bx-for-counter0": i,
                        "bx-for-first": i == 0,
                        "bx-for-last": i == loop_data.length - 1,
                    };
                    let item = createElementFromHTML(loop_html);
                    el.before(item);
                    loop_method.call(BX, i, item, each_context);
                }
                el.remove();
            },
        };
    },
    clean() {
        const loop_elements = document.querySelectorAll(`[bx-each-id='${this.id}']`);
        let item = createElementFromHTML(this.get_context("loop_html"));
        if (loop_elements.length) {
            loop_elements[0].after(item);
            item.removeAttribute("bx-each-id");
            item.setAttribute("bx-for", this.get_context("base_attr"));
        }
        loop_elements.forEach((e) => e.remove());
    },
});
registry.add(FOR_TAG);
// As template tag
const AS_TEMPLATE_TAG = tagFactory({
    name: "as-template",
    type: TagType.block,
    use() {
        this.BX.templates[this.attr] = this.el.innerHTML;
        this.el.remove();
        return {
            break_loop: true,
        };
    },
});
registry.add(AS_TEMPLATE_TAG);
// Get template tag
const GET_TEMPLATE_TAG = tagFactory({
    name: "get-template",
    type: TagType.block,
    use() {
        this.el.innerHTML = this.BX.templates[this.attr];
    },
    clean() {
        this.el.innerHTML = "";
    },
});
registry.add(GET_TEMPLATE_TAG);
// Context tag
const CONTEXT_TAG = tagFactory({
    name: "context",
    type: TagType.block,
    use() {
        return {
            context: this.data,
        };
    },
});
registry.add(CONTEXT_TAG);
// Break Loop Tag
const BREAK_TAG = tagFactory({
    name: "break",
    type: TagType.block,
    use() {
        return {
            break_loop: true,
        };
    },
});
registry.add(BREAK_TAG);
// Break is tag
const BREAK_IS_TAG = tagFactory({
    name: "break-is",
    type: TagType.block,
    use() {
        let res = {
            break_loop: false,
        };
        try {
            res.break_loop = !this.data;
        } catch (e) {
            res.break_loop = true;
        }
        this.add_context("base_attr", this.attr);
        this.remove_tag_attribute();
        return res;
    },
    clean() {
        this.el.setAttribute("bx-break-is", this.get_context("base_attr"));
    },
});
registry.add(BREAK_IS_TAG);
// Show is tag
const SHOW_IS_TAG = tagFactory({
    name: "show-is",
    type: TagType.block,
    use() {
        if (this.data) this.el.style.removeProperty("display");
    },
    clean() {
        this.el.style.display = "none";
    },
});
registry.add(SHOW_IS_TAG);
// Get text tag
const GET_TEXT_TAG = tagFactory({
    name: "get-text",
    type: TagType.helper,
    use() {
        this.el.innerHTML = this.data;
    },
    clean() {
        this.el.innerHTML = "";
    },
});
registry.add(GET_TEXT_TAG);
// Get value tag
const GET_VALUE_TAG = tagFactory({
    name: "get-value",
    type: TagType.helper,
    use() {
        let el = this.el as HTMLInputElement;
        el.value = this.data;
    },
    clean() {
        let el = this.el as HTMLInputElement;
        el.value = "";
    },
});
registry.add(GET_VALUE_TAG);
// Set attr tag
const SET_ATTR_TAG = tagFactory({
    name: "set-attr",
    type: TagType.helper,
    use() {
        //'{prop_path}>[{attr_name}]'
        let regexp_group = /(.*?)>\[(.*?)\]/g.exec(this.attr);
        let context = this.get_data(regexp_group[1], this.context);
        this.add_context("target_attr", regexp_group[2]);
        this.el.setAttribute(this.get_context("target_attr"), context);
    },
    clean() {
        this.el.removeAttribute(this.get_context("target_attr"));
    },
});
registry.add(SET_ATTR_TAG);

export { registry };
