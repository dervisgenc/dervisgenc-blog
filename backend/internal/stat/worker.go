package stat

import (
	"context"
	"net/http"

	myerr "github.com/dervisgenc/dervisgenc-blog/backend/pkg"
	"github.com/dervisgenc/dervisgenc-blog/backend/pkg/models"
	"github.com/sirupsen/logrus"
)

type StatsWorker struct {
	visitChan   chan *models.Visitor
	viewChan    chan *models.PostView
	repository  StatRepository
	workerCount int
	logger      *logrus.Logger
}

func NewStatsWorker(repo StatRepository, workerCount int, logger *logrus.Logger) *StatsWorker {
	w := &StatsWorker{
		visitChan:   make(chan *models.Visitor, 1000),
		viewChan:    make(chan *models.PostView, 1000),
		repository:  repo,
		workerCount: workerCount,
		logger:      logger,
	}
	w.Start()
	return w
}

func (w *StatsWorker) Start() {
	for i := 0; i < w.workerCount; i++ {
		go w.processVisits()
		go w.processViews()
	}
}

func (w *StatsWorker) processVisits() {
	for visit := range w.visitChan {
		if err := w.repository.RecordVisit(visit); err != nil {
			w.logger.WithFields(logrus.Fields{
				"ip_address": visit.IPAddress,
				"path":       visit.Path,
				"error":      err.Error(),
			}).Error("Failed to record visit")
		}
	}
}

func (w *StatsWorker) processViews() {
	for view := range w.viewChan {
		if err := w.repository.RecordPostView(view); err != nil {
			w.logger.WithFields(logrus.Fields{
				"post_id":    view.PostID,
				"ip_address": view.IPAddress,
				"error":      err.Error(),
			}).Error("Failed to record post view")
		}
	}
}

func (w *StatsWorker) QueueVisit(visitor *models.Visitor) {
	select {
	case w.visitChan <- visitor:
	default:
		w.logger.WithFields(logrus.Fields{
			"ip_address": visitor.IPAddress,
			"path":       visitor.Path,
		}).Warn("Visit queue full, skipping record")
	}
}

func (w *StatsWorker) QueueView(view *models.PostView) {
	select {
	case w.viewChan <- view:
	default:
		w.logger.WithFields(logrus.Fields{
			"post_id":    view.PostID,
			"ip_address": view.IPAddress,
		}).Warn("View queue full, skipping record")
	}
}

func (w *StatsWorker) Shutdown(ctx context.Context) error {
	done := make(chan bool)
	go func() {
		close(w.visitChan)
		close(w.viewChan)
		done <- true
	}()

	select {
	case <-done:
		w.logger.Info("Stats worker shutdown completed")
		return nil
	case <-ctx.Done():
		return myerr.WithHTTPStatus(ctx.Err(), http.StatusInternalServerError)
	}
}
