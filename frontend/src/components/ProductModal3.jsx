import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusCircleIcon, XIcon } from "lucide-react";


function ProductModal3() {
  const { addProduct, formData, setFormData, resetFormData, loading } = useProductStore();

  const handleMediaUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 8 - formData.media.length;
    const newFiles = files.slice(0, remainingSlots).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setFormData({
      ...formData,
      media: [...formData.media, ...newFiles]
    });
    e.target.value = ""; // reset input for re-uploads
  }, [formData, setFormData]);

  const handleRemoveMedia = useCallback((mediaId) => {
    const mediaToRemove = formData.media.find(m => m.id === mediaId);
    if (mediaToRemove) URL.revokeObjectURL(mediaToRemove.preview);
    
    setFormData({
      ...formData,
      media: formData.media.filter(m => m.id !== mediaId)
    });
  }, [formData, setFormData]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.media);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);
    setFormData({ ...formData, media: items });
  };

  return (
    <dialog id="my_modal_2" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button onClick={resetFormData} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="font-bold text-lg mb-8">Add New Product</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addProduct();
          }}
          className="space-y-6"
        >
          {/* ... other form fields ... */}
          
          {/* Media Upload Section */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-base font-medium">Product Media (max 8)</span>
            </label>
            <div className="flex flex-wrap gap-4">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="mediaList" direction="horizontal">
                  {(provided) => (
                    <div className="flex gap-4" ref={provided.innerRef} {...provided.droppableProps}>
                      {formData.media.map((media, index) => (
                        <Draggable key={media.id} draggableId={media.id} index={index}>
                          {(provided) => (
                            <div
                              className="relative group w-24 h-24"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {media.file.type.startsWith('video/') ? (
                                <video className="w-full h-full object-cover rounded-lg border">
                                  <source src={media.preview} type={media.file.type} />
                                </video>
                              ) : (
                                <img
                                  src={media.preview}
                                  alt="Preview"
                                  className="w-full h-full object-cover rounded-lg border"
                                />
                              )}
                              {/* Mark first image as thumbnail */}
                              {index === 0 && (
                                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1">
                                  Thumbnail
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMedia(media.id)}
                                className="btn btn-xs btn-circle absolute -top-2 -right-2 bg-error border-error hover:bg-error/80 text-white"
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              {formData.media.length < 8 && (
                <div className="w-24 h-24">
                  <label
                    htmlFor="media-upload"
                    className="btn btn-outline w-full h-full flex flex-col items-center justify-center cursor-pointer p-0 rounded-lg border-dashed hover:border-primary"
                  >
                    <PlusCircleIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs">Add Media</span>
                  </label>
                  <input
                    id="media-upload"
                    type="file"
                    multiple
                    accept="image/*, video/*"
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ... remaining form fields and buttons ... */}
          <div className="modal-action">
            <form method="dialog">
              <button onClick={resetFormData} className="btn btn-ghost">Cancel</button>
            </form>
            <button
              disabled={!formData.name || !formData.price || !formData.image}
              type="submit"
              className="btn btn-md btn-primary"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <PlusCircleIcon className="size-5 mr-2" />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={resetFormData}>close</button>
      </form>
    </dialog>
  );
}

export default ProductModal3;
