/** One item of a learner's own plan on a batch's mind map. */
export interface PlanNode {
  id: string;
  text: string;
  /** The week it hangs from. */
  week: number;
  done?: boolean;
}
