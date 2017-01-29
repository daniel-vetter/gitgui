import { Injectable } from "@angular/core";
import { HistoryRepository } from "../model/model";

@Injectable()
export class LaneAssigner {

    /**
     * Assigns every commit a lane
     * @returns the the highest lane count assigned
     */
    assignLanes(repository: HistoryRepository): void {
        const lanes: number[] = [];
        for (const commit of repository.commits) {

            for (let i = 0; i < lanes.length; i++) {
                if (lanes[i] <= commit.index)
                    lanes[i] = undefined;
            }

            const blockLaneTill = (x: number) => {
                let free = lanes.indexOf(undefined);
                if (free === -1) {
                    lanes.push(undefined);
                    free = lanes.length - 1;
                }
                lanes[free] = x;
                return free;
            };

            if (commit.children.length === 0) {
                commit.lane = blockLaneTill(commit.index);
            }

            for (const parent of commit.parents) {
                if (parent.lane === undefined) {
                    if (commit.parents[0] === parent) {
                        parent.lane = commit.lane;
                        lanes[commit.lane] = parent.index;
                    } else {
                        parent.lane = blockLaneTill(parent.index);
                    }
                } else {
                    if (commit.parents[0] !== parent)
                        lanes[parent.lane] = parent.index;
                    else
                        lanes[commit.lane] = parent.index;
                }
            }
        }

        repository.totalLaneCount = lanes.length;
    }
}
