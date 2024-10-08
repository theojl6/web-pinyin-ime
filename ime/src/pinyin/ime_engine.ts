import flatten from "lodash/flatten";
import uniq from "lodash/uniq";
import { dict, packedTrie } from "./google_pinyin_dict_utf8_55320";
import { PTrie } from "dawg-lookup/src/ptrie";

interface IDict {
  [key: string]: IWord[];
}

interface IWord {
  w: string;
  f: number;
}

const typedDict: IDict = dict;

const trie = new PTrie(packedTrie);
const getCandidates = (input: string): string[] => {
  let list: IWord[] = [];
  let candidates: string[] = [];

  if (input) {
    const value: IWord[] = typedDict[input];
    if (value) {
      // full pinyin match, or abbr match.
      list = value;
    } else if (input.length >= 1) {
      // pinyin prefix match, using prepared packed trie data.
      list = flatten(
        trie.completions(input).map((key: string) => typedDict[key])
      );
    }

    //sort candidates by word frequency
    candidates = list
      .filter((item: IWord) => !!item)
      .sort((a, b) => b.f - a.f)
      .map((item) => item.w);
  }

  return uniq(candidates);
};

export default getCandidates;
