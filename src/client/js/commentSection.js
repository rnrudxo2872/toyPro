const videoContainer = document.getElementById("videoContainer")
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");

const handleSubmit = (event) => {
    event.preventDefault();
    console.log(textarea.value);
    console.log(videoContainer.dataset);
    const text = textarea.value;
    const video = videoContainer.dataset.id;
}

form.addEventListener("submit",handleSubmit)