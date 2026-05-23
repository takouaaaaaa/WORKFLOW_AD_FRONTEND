export default function FileOutPagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) {
  return (
    <div className="fileout-footer">
      <div className="fileout-pagination">
        <button
          type="button"
          className="fileout-btn-page"
          disabled={currentPage === 1}
          onClick={onPrev}
        >
          Previous
        </button>

        <span>
          Page {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          className="fileout-btn-page"
          disabled={currentPage === totalPages}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}