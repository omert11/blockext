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
        let loop_data = this.data;
        if (!loop_data) loop_data = [];
        else if (!Array.isArray(loop_data)) loop_data = [loop_data];
        this.remove_tag_attribute();
        this.el.setAttribute("bx-each-id", this.id.toString());
        const loop_html = this.el.outerHTML;
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
});
registry.add(FOR_TAG);
// IF Is Tag
const IF_IS_TAG = tagFactory({
    name: "if-is",
    type: TagType.each,
    use() {
        interface NodeData {
            el: HTMLElement;
            tag: string;
            attr: string;
            condition: boolean;
        }
        const nodeInstance = {
            ...this.context,
            __nd(el: HTMLElement, tag: string, condition = false): NodeData {
                let attr = el.getAttribute(tag);
                if (!condition)
                    try {
                        condition = eval(attr);
                    } catch (e) {}
                return {
                    el,
                    tag,
                    attr,
                    condition,
                };
            },
        };

        let nodes = [nodeInstance.__nd(this.el, "bx-if-is")];
        let lastNode = this.el;
        while (lastNode.nextElementSibling && ["bx-elif-is", "bx-else"].some((t) => lastNode.nextElementSibling.hasAttribute(t))) {
            lastNode = lastNode.nextElementSibling as HTMLElement;
            if (lastNode.hasAttribute("bx-else")) {
                nodes.push(nodeInstance.__nd(lastNode, "bx-else", true));
                break;
            }
            nodes.push(nodeInstance.__nd(lastNode, "bx-elif-is"));
        }
        let active_node = nodes.find((i) => i.condition);
        nodes.filter((i) => i.el != active_node.el).forEach((e) => e.el.remove());
        active_node.el.removeAttribute(active_node.tag);
        return {
            break_loop: true,
        };
    },
});
registry.add(IF_IS_TAG);

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
        this.remove_tag_attribute();
        return res;
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
});
registry.add(SHOW_IS_TAG);
// Get text tag
const GET_TEXT_TAG = tagFactory({
    name: "get-text",
    type: TagType.helper,
    use() {
        this.el.innerHTML = this.data;
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
});
registry.add(GET_VALUE_TAG);
// Set attr tag
const SET_ATTR_TAG = tagFactory({
    name: "set-attr",
    type: TagType.helper,
    use() {
        /**
         * '{prop_path}>{attr_name}'
         * or
         * '{prop_paths}>{attr_name}]>template'
         * sample -> 'foo,bar,baz>[name]>$$[$$][$$]'
         */
        let sections = this.attr.split(">");
        let template = sections.length == 2 ? "$$" : sections[2];

        let prop_paths = sections[0].split(",");
        let props = prop_paths.map((p) => this.get_data(p, this.context));

        template = props.reduce((p, c) => p.replace("$$", c), template);

        this.el.setAttribute(sections[1], template);

        this.remove_tag_attribute();
    },
});
registry.add(SET_ATTR_TAG);

export { registry };
