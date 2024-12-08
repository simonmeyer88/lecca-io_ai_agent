type Props = {
  imageData: string[];
};

export function MessageImage({ imageData }: Props) {
  return imageData.length > 0 ? (
    imageData.map((src, index) => (
      <div key={index} className="rounded-3xl overflow-hidden shadow">
        <img
          src={`${src}`}
          alt="Message that was uploaded"
          className="max-w-[500px]"
          onError={(e) => {
            e.currentTarget.style.display = 'none'; // Hide the image
            const fallback = document.createElement('div');
            fallback.textContent = 'Image only available for 24 hours.';
            fallback.className =
              'text-xs bg-muted/50 px-5 py-3 rounded-3xl text-muted-foreground'; // Add a class for styling
            e.currentTarget.parentNode!.appendChild(fallback);
          }}
        />
      </div>
    ))
  ) : (
    <div>No images available.</div>
  );
}
