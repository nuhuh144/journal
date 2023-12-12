async function loader() {
    try {
        const doc = readvar('doc');
        document.getElementById('editor').innerHTML = doc;
    } catch (error) {
        console.log(error);
    }
}