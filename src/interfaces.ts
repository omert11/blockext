import { TagType } from "./enums";

interface TagResponse {
    break_loop: Boolean;
    context: any;
    each_method?(el: HTMLElement, context: any, loop_method: loopFunction, BX: IBlockeXt): void;
}
interface TagConfig {
    name: string;
    type: TagType;
    use(this: Tag): void;
}
interface TagArgs {
    el: HTMLElement;
    context: any;
    BX: IBlockeXt;
}
interface Tag extends TagArgs, TagConfig {
    id: Number;
    tag_context: Object;
    use(this: Tag): TagResponse;
    add_context(key: string, value: any): void;
    get_context(key: string): any;
    del_context(key: string): void;
    get_html_attribute(el: HTMLElement): string | undefined;
    get_data(attrs: string, context: any): any;
    remove_tag_attribute(): any;
    readonly attr: string;
    readonly data: any;
}
interface factoryFunction {
    (x: TagArgs): Tag;
    _name: string;
    _type: TagType;
}

interface IBlockeXt {
    el: HTMLElement;
    main_elements: NodeListOf<HTMLElement>;
    templates: Object;
    tag_instances: Tag[];
    used_tags: string[];
    tags: factoryFunction[];
    collect_tags(el: HTMLElement, regexp?: RegExp): void;
    readonly each_tags: factoryFunction[];
    readonly block_tags: factoryFunction[];
    readonly helper_tags: factoryFunction[];
    get_each_tags(el: HTMLElement, context: any): Generator<Tag, any, unknown>;
    get_block_tags(el: HTMLElement, context: any): Generator<Tag, any, unknown>;
    get_helper_tags(el: HTMLElement, context: any): Generator<Tag, any, unknown>;
    main_loop(data: any): void;
    top_loop(el: HTMLElement, context: any, each_method?: eachFunction): void;
    loop: loopFunction;
    do_each(item: HTMLElement, context: any): TagResponse;
    do_blocks(item: HTMLElement, context: any): TagResponse;
    do_helpers(item: HTMLElement, context: any): TagResponse;
}
type loopFunction = (index: Number, item: HTMLElement, context: any) => void;
type eachFunction = (el: HTMLElement, context: any, loop_method: loopFunction, BX: IBlockeXt) => void;

export { TagConfig, TagArgs, Tag, factoryFunction, IBlockeXt, loopFunction, eachFunction };
