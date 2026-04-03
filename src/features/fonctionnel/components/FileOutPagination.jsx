export default function FileOutPagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) {
  return (
    <div className="filein-action-bar">
      <div className="filein-pagination">
        <button
          className="filein-btn-page"
          disabled={currentPage === 1}
          onClick={onPrev}
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="filein-btn-page"
          disabled={currentPage === totalPages}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}