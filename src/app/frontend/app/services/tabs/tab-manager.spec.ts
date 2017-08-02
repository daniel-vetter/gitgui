import { TabManager, TabPage } from "./tab-manager";
import { HistoryTabData } from "../../main/tabs/tabs";
import { Repository } from "../git/model";
import { TabData } from "app/main/tabs/tabs";

describe(TabManager.name, () => {
    interface EventRecord {
        eventType: string;
        selectedTab: TabPage | undefined;
        allTabs: TabPage[];
    }

    const repository = new Repository();

    function monitorEvents(x: TabManager): EventRecord[] {
        const events: EventRecord[] = [];
        x.onTabListChanged.subscribe(() => {
            events.push({
                eventType: "onTabListChanged",
                selectedTab: x.selectedTab,
                allTabs: Array.from(x.allTabPages)
            });
        });

        x.onSelectedTabChanged.subscribe(() => {
            events.push({
                eventType: "onSelectedTabChanged",
                selectedTab: x.selectedTab,
                allTabs: Array.from(x.allTabPages)
            });
        });
        return events;
    }

    it("A fresh TabManager should contain no tabs", () => {
        expect(new TabManager().allTabPages.length).toBe(0);
    });

    describe("Adding a tab", () => {

        const tabManager = new TabManager();
        const tab = tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });

        it("should add a tab to the tab list", () => {
            expect(tabManager.allTabPages.length).toBe(1);
        });

        it("should select the new tab", () => {
            expect(tabManager.selectedTab).toBe(tab);
        });
    });

    describe("Adding a tab", () => {
        it("should fire all events in the correct order", () => {
            const tabManager = new TabManager();
            const events = monitorEvents(tabManager);

            const tab = tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });

            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onTabListChanged", selectedTab: undefined, allTabs: [tab] },
                { eventType: "onSelectedTabChanged", selectedTab: tab, allTabs: [tab] }
            ]);
        });
    });

    describe("After removing the last tab", () => {

        const tabManager = new TabManager();
        const tab = tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        tabManager.closeTab(tab);

        it("should not have any tabs", () => {
            expect(tabManager.allTabPages.length).toBe(0);
        });

        it("should not have any tab selected", () => {
            expect(tabManager.selectedTab).toBe(undefined);
        });
    });

    describe("Removing the last tab", () => {
        it("should fire all events in the correct order", () => {
            const tabManager = new TabManager();
            const tab = tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
            const events = monitorEvents(tabManager);

            tabManager.closeTab(tab);

            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onSelectedTabChanged", selectedTab: undefined, allTabs: [tab] },
                { eventType: "onTabListChanged", selectedTab: undefined, allTabs: [] }
            ]);
        });
    });

    describe("Changing the selected tab", () => {

        const tabManager = new TabManager();
        tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        let eventFired = false;
        tabManager.onSelectedTabChanged.subscribe(() => eventFired = true);

        tabManager.selectedTab = tabManager.allTabPages[1];

        it("should change the selected tab", () => {
            expect(tabManager.selectedTab).toBe(tabManager.allTabPages[1]);
        });

        it("should fire the selectedTabChanged event", () => {
            expect(eventFired).toBe(true);
        });
    });

    describe("Changing away from a temporary tab", () => {
        const tabManager = new TabManager();
        const persistentTab = tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        const tempTab = tabManager.createNewTempTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        const events = monitorEvents(tabManager);
        tabManager.selectedTab = persistentTab;

        it("should not close the temporary tab", () => expect(tabManager.allTabPages).toContain(tempTab));
        it("should selected the persistent tab", () => expect(tabManager.selectedTab).toBe(persistentTab));
        it("should fire event in correct order", () => {
            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onSelectedTabChanged", selectedTab: persistentTab, allTabs: [persistentTab, tempTab] }
            ]);
        })
    });

    describe("Creating a new temp tab if a temporary tab is currently selected", () => {
        const tabManager = new TabManager();
        const tempTab1 = tabManager.createNewTempTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        const events = monitorEvents(tabManager);
        const tempTab2 = tabManager.createNewTempTab({ type: "HistoryTab", repository: Promise.resolve(repository) });

        it("should close the temporary tab", () => expect(tabManager.allTabPages).not.toContain(tempTab1));
        it("should selected the persistent tab", () => expect(tabManager.selectedTab).toBe(tempTab2));
        it("should fire the events in correct order", () => {
            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onSelectedTabChanged", selectedTab: undefined, allTabs: [tempTab1] },
                { eventType: "onTabListChanged", selectedTab: undefined, allTabs: [] },
                { eventType: "onTabListChanged", selectedTab: undefined, allTabs: [tempTab2] },
                { eventType: "onSelectedTabChanged", selectedTab: tempTab2, allTabs: [tempTab2] }
            ]);
        })
    })

    describe("Creating a new temp tab if a temporary tab is currently open", () => {
        const tabManager = new TabManager();
        const tempTab = tabManager.createNewTempTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        const persistentTab = tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        const events = monitorEvents(tabManager);
        const tempTab2 = tabManager.createNewTempTab({ type: "HistoryTab", repository: Promise.resolve(repository) });

        it("should close the temporary tab", () => expect(tabManager.allTabPages).not.toContain(tempTab));
        it("should selected the persistent tab", () => expect(tabManager.selectedTab).toBe(tempTab2));
        it("should fire the events in correct order", () => {
            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onTabListChanged", selectedTab: persistentTab, allTabs: [persistentTab] },
                { eventType: "onTabListChanged", selectedTab: persistentTab, allTabs: [persistentTab, tempTab2] },
                { eventType: "onSelectedTabChanged", selectedTab: tempTab2, allTabs: [persistentTab, tempTab2] },
            ]);
        })
    })

    describe("Converting a tab from persistent to temp", () => {
        const tabManager = new TabManager();
        const tempTab = tabManager.createNewTempTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        const persistentTab1 = tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        const changingTab = tabManager.createNewTab({ type: "HistoryTab", repository: Promise.resolve(repository) });
        const events = monitorEvents(tabManager);
        changingTab.isPersistent = false;

        it("should close the old temporary tab", () => expect(tabManager.allTabPages).not.toContain(tempTab));
        it("should fire the events in correct order", () => {
            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onTabListChanged", selectedTab: changingTab, allTabs: [persistentTab1, changingTab] }
            ]);
        })
    })
});
