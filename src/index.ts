import { factoryFunction, tagFactory } from "./factory";
import { eachFunction, IBlockeXt, loopFunction, Tag } from "./interfaces";
import registry from "./registry";
function default_each_method(el: HTMLElement, context: any, loop_method: loopFunction, RC: IBlockeXt) {
    el.childNodes.forEach((item, i) => loop_method.call(RC, i, item, context));
}
class BlockeXt implements IBlockeXt {
    el: HTMLElement;
    main_elements: NodeListOf<HTMLElement>;
    templates: Object;
    tag_instances: Tag[];
    used_tags: string[];
    tags: factoryFunction[];
    constructor(selectorOrElement: keyof HTMLElementTagNameMap | HTMLElement) {
        let el = null;
        if (typeof selectorOrElement == "string") {
            el = document.querySelector(selectorOrElement);
            if (!el) throw Error(`No element found in the dom with selector '${selectorOrElement}'.`);
        } else el = selectorOrElement;
        this.el = el;
        this.main_elements = this.el.querySelectorAll("[bx-main]");
        this.tag_instances = [];
        this.collect_tags(this.el);
    }
    collect_tags(el: HTMLElement, regexp: RegExp = /bx-(.*?)="(.*?)"/g) {
        let match_result = Array.from(el.outerHTML.matchAll(regexp));
        let used_tags = [];
        match_result.forEach((r) => {
            if (!used_tags.includes(r[0])) used_tags.push(r[0]);
        });
        this.used_tags = used_tags;
        this.tags = registry.get_tag_methods(this.used_tags);
    }
    get_filtered_TAGS(type: TagType): factoryFunction[] {
        if (!this[`__${type}_tag_cache`]) this[`__${type}_tag_cache`] = this.tags.filter((i) => i.type == type);
        return this[`__${type}_tag_cache`];
    }
    *get_TAG_iter(el: HTMLElement, context: any, tags: factoryFunction[]) {
        for (const tag of tags) {
            let attribute = el.getAttribute(`bx-${tag.name}`);
            if (attribute) {
                const tag_instance = tag({ el, context });
                yield tag_instance;
            }
        }
    }
    get each_tags() {
        return this.get_filtered_TAGS(TagType.each);
    }
    get_each_tags(el: HTMLElement, context: any): Generator<Tag, any, unknown> {
        return this.get_TAG_iter(el, context, this.each_tags);
    }
    main_loop(data: any) {
        this.main_elements.forEach((el) => this.top_loop(el, data, default_each_method));
    }
    top_loop(el: HTMLElement, context: any, each_method: eachFunction) {
        each_method(el, context, this.loop, this);
    }
    loop(i: Number, item: HTMLElement, context: any) {
        let each_response = this.do_each(item, context);
        this.top_loop(item, context, each_response.each_method);
    }
    do_each(el: HTMLElement, context: any) {
        let each_tag: Tag | undefined = this.get_each_tags(el, context).next().value;
        return each_tag ? each_tag.use() : { break_loop: false, context: context };
    }
}

export default BlockeXt;
export { BlockeXt, registry, tagFactory };
