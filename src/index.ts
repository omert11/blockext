import { TagType } from "./enums";
import { factoryFunction, tagFactory } from "./factory";
import { eachFunction, IBlockeXt, loopFunction, Tag } from "./interfaces";
import { registry } from "./registry";

function default_each_method(el: HTMLElement, context: any, loop_method: loopFunction, BX: IBlockeXt) {
    const length = el.children.length;
    for (let i = 0; i < length; i++) {
        if (el.children?.[i]) loop_method.call(BX, i, el.children[i], context);
    }
}
class BlockeXt implements IBlockeXt {
    el: HTMLElement;
    raw_html: string;
    main_elements: NodeListOf<HTMLElement>;
    templates: Object;
    tag_instances: Tag[];
    used_tags: string[];
    tags: factoryFunction[];
    static registry = registry;
    static tagFactory = tagFactory;
    constructor(selectorOrElement: keyof HTMLElementTagNameMap | HTMLElement | string) {
        let el = null;
        if (typeof selectorOrElement == "string") {
            el = document.querySelector(selectorOrElement);
            if (!el) throw Error(`No element found in the dom with selector '${selectorOrElement}'.`);
        } else el = selectorOrElement;
        this.el = el;
        this.main_elements = this.el.querySelectorAll("[bx-main]");
        this.raw_html = this.el.innerHTML;
        this.tag_instances = [];
        this.templates = {};
        this.collect_tags(this.el);
    }
    collect_tags(el: HTMLElement, regexp: RegExp = /bx-(.*?)="(.*?)"/g) {
        let match_result = Array.from(el.outerHTML.matchAll(regexp));
        let used_tags = [];
        match_result.forEach((r) => {
            if (!used_tags.includes(r[1])) used_tags.push(r[1]);
        });
        this.used_tags = used_tags;
        this.tags = registry.get_tag_methods(this.used_tags);
    }
    get_filtered_TAGS(type: TagType): factoryFunction[] {
        if (!this[`__${type}_tag_cache`]) this[`__${type}_tag_cache`] = this.tags.filter((i) => i._type == type);
        return this[`__${type}_tag_cache`];
    }
    *get_TAG_iter(el: HTMLElement, context: any, tags: factoryFunction[]) {
        for (const tag of tags) {
            let attribute = el.getAttribute(`bx-${tag._name}`);
            if (attribute) {
                const tag_instance = tag({ el, context, BX: this });
                this.tag_instances.push(tag_instance);
                yield tag_instance;
            }
        }
    }
    get each_tags() {
        return this.get_filtered_TAGS(TagType.each);
    }
    get block_tags() {
        return this.get_filtered_TAGS(TagType.block);
    }
    get helper_tags() {
        return this.get_filtered_TAGS(TagType.helper);
    }
    get_each_tags(el: HTMLElement, context: any): Generator<Tag, any, unknown> {
        return this.get_TAG_iter(el, context, this.each_tags);
    }
    get_block_tags(el: HTMLElement, context: any): Generator<Tag, any, unknown> {
        return this.get_TAG_iter(el, context, this.block_tags);
    }
    get_helper_tags(el: HTMLElement, context: any): Generator<Tag, any, unknown> {
        return this.get_TAG_iter(el, context, this.helper_tags);
    }
    main_loop(data: any) {
        this.main_elements.forEach((el) => this.top_loop(el, data, default_each_method));
    }
    top_loop(el: HTMLElement, context: any, each_method: eachFunction) {
        let helper_response = this.do_helpers(el, context);

        if (helper_response.break_loop) return;
        context = helper_response.context;

        each_method(el, context, this.loop, this);

        return el;
    }
    loop(i: Number, item: HTMLElement, context: any) {
        let block_response = this.do_blocks(item, context);

        if (!block_response.break_loop) {
            let child_context = block_response.context;

            let each_response = this.do_each(item, child_context);
            this.top_loop(item, child_context, each_response.each_method || default_each_method);
        }
        return item;
    }
    do_each(el: HTMLElement, context: any) {
        let each_tag: Tag | undefined = this.get_each_tags(el, context).next().value;
        return each_tag ? each_tag.use() : { break_loop: false, context: context };
    }
    do_blocks(el: HTMLElement, context: any) {
        let break_loop = false;
        let block_iter = this.get_block_tags(el, context);
        for (const tag of block_iter) {
            let response = tag.use();
            if (response.break_loop) {
                break_loop = true;
                break;
            }
            context = response.context;
        }
        return {
            break_loop,
            context,
        };
    }
    do_helpers(el: HTMLElement, context: any) {
        let break_loop = false;
        let helper_iter = this.get_helper_tags(el, context);
        for (const tag of helper_iter) {
            let response = tag.use();
            if (response.break_loop) {
                break_loop = true;
                break;
            }
            context = response.context;
        }
        return {
            break_loop,
            context,
        };
    }
    render(data: any) {
        this.main_loop(data);
    }
    clean() {
        this.el.innerHTML = this.raw_html;
        this.main_elements = this.el.querySelectorAll("[bx-main]");
        this.tag_instances = [];
    }
}
globalThis.BlockeXt = BlockeXt;
export default BlockeXt;
