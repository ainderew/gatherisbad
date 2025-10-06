function useUiControls() {
    //TODO: make helper and enums for this
    function changeSprite() {
        console.log("Change Sprite");
        window.dispatchEvent(
            new CustomEvent("change-sprite", { detail: true }),
        );
    }

    return {
        changeSprite,
    };
}

export default useUiControls;
