/* ============================================================
   GALLERY — photo slider (photos.html)
   ย้ายมาจาก inline script เดิม
============================================================ */


    document.addEventListener(
      "DOMContentLoaded",
      function () {


        /* =====================================================
           PHOTO LIST

           เพิ่มหรือลดรูปตรงนี้ได้เลย

           ตัวอย่าง:
           "pic/photo/photo-11.jpg"
           "pic/photo/photo-12.jpg"
        ====================================================== */

        const photos = [

          "pic/photo/photo-01.jpg",

          "pic/photo/photo-02.jpg",

          "pic/photo/photo-03.jpg",

          "pic/photo/photo-04.jpg",

          "pic/photo/photo-05.jpg",

          "pic/photo/photo-06.jpg",

          "pic/photo/photo-07.jpg",

          "pic/photo/photo-08.jpg",

          "pic/photo/photo-09.jpg",

          "pic/photo/photo-10.jpg",

          "pic/photo/photo-11.jpg"

        ];



        /* =====================================================
           GET ELEMENTS
        ====================================================== */

        const slider =
          document.getElementById(
            "mainSlider"
          );


        const track =
          document.getElementById(
            "mainSliderTrack"
          );


        const thumbnailTrack =
          document.getElementById(
            "thumbnailTrack"
          );


        const dotsContainer =
          document.getElementById(
            "photoDots"
          );


        const prevButton =
          document.getElementById(
            "photoPrev"
          );


        const nextButton =
          document.getElementById(
            "photoNext"
          );



        let currentIndex = 0;



        /* =====================================================
           CREATE MAIN SLIDES
        ====================================================== */

        photos.forEach(
          function (photo, index) {


            const slide =
              document.createElement(
                "div"
              );


            slide.className =
              "main-slide";


            const image =
              document.createElement(
                "img"
              );


            image.src =
              photo;


            image.alt =
              "Wedding photo " +
              (index + 1);


            /*
              รูปแรกโหลดก่อน
              รูปอื่น lazy load
            */

            if (index === 0) {

              image.loading =
                "eager";

            } else {

              image.loading =
                "lazy";

            }


            image.draggable =
              false;


            slide.appendChild(
              image
            );


            track.appendChild(
              slide
            );

          }
        );



        /* =====================================================
           CREATE THUMBNAILS
        ====================================================== */

        photos.forEach(
          function (photo, index) {


            const button =
              document.createElement(
                "button"
              );


            button.type =
              "button";


            button.className =
              "thumbnail";


            button.setAttribute(
              "aria-label",
              "View photo " +
              (index + 1)
            );


            const image =
              document.createElement(
                "img"
              );


            /* thumbnail ใช้ไฟล์ย่อใน pic/photo/thumb/ แทนไฟล์เต็ม */
            image.src =
              photo.replace("pic/photo/", "pic/photo/thumb/");


            image.alt = "";


            image.loading =
              "lazy";


            image.draggable =
              false;


            button.appendChild(
              image
            );


            button.addEventListener(
              "click",
              function () {

                goToPhoto(
                  index
                );

              }
            );


            thumbnailTrack.appendChild(
              button
            );

          }
        );



        /* =====================================================
           CREATE DOTS
        ====================================================== */

        photos.forEach(
          function (_, index) {


            const dot =
              document.createElement(
                "button"
              );


            dot.type =
              "button";


            dot.className =
              "photo-dot";


            dot.setAttribute(
              "aria-label",
              "View photo " +
              (index + 1)
            );


            dot.addEventListener(
              "click",
              function () {

                goToPhoto(
                  index
                );

              }
            );


            dotsContainer.appendChild(
              dot
            );

          }
        );



        const thumbnails =
          thumbnailTrack.querySelectorAll(
            ".thumbnail"
          );


        const dots =
          dotsContainer.querySelectorAll(
            ".photo-dot"
          );



        /* =====================================================
           GO TO PHOTO
        ====================================================== */

        function goToPhoto(index) {


          /*
            ถ้าเลื่อนก่อนรูปแรก
            ให้ไปท้ายสุด
          */

          if (index < 0) {

            index =
              photos.length - 1;

          }



          /*
            ถ้าเกินรูปสุดท้าย
            ให้กลับรูปแรก
          */

          if (
            index >=
            photos.length
          ) {

            index = 0;

          }


          currentIndex =
            index;



          /* เลื่อนรูปใหญ่ */

          track.style.transform =
            "translateX(-" +
            (
              currentIndex *
              100
            ) +
            "%)";



          /* Thumbnail active */

          thumbnails.forEach(
            function (
              thumbnail,
              thumbIndex
            ) {

              thumbnail.classList.toggle(
                "active",
                thumbIndex ===
                currentIndex
              );

            }
          );



          /* Dot active */

          dots.forEach(
            function (
              dot,
              dotIndex
            ) {

              dot.classList.toggle(
                "active",
                dotIndex ===
                currentIndex
              );

            }
          );



          /*
            ===================================================
            เลื่อนแถว thumbnail ตามรูปใหญ่

            behavior smooth
            inline center

            ทำให้ thumbnail ที่ active
            เลื่อนมาอยู่กลางหน้าจออัตโนมัติ
            ===================================================
          */

          const activeThumbnail =
            thumbnails[
              currentIndex
            ];


          if (
            activeThumbnail
          ) {

            activeThumbnail.scrollIntoView(
              {

                behavior:
                  "smooth",

                inline:
                  "center",

                block:
                  "nearest"

              }
            );

          }

        }



        /* =====================================================
           NEXT
        ====================================================== */

        nextButton.addEventListener(
          "click",
          function () {

            goToPhoto(
              currentIndex + 1
            );

          }
        );



        /* =====================================================
           PREVIOUS
        ====================================================== */

        prevButton.addEventListener(
          "click",
          function () {

            goToPhoto(
              currentIndex - 1
            );

          }
        );



        /* =====================================================
           SWIPE MOBILE
        ====================================================== */

        let pointerStartX = 0;

        let pointerStartY = 0;

        let dragging = false;



        slider.addEventListener(
          "pointerdown",
          function (event) {


            /*
              ไม่จับ click
              ที่เกิดจาก arrow
            */

            if (
              event.target.closest(
                ".slider-arrow"
              )
            ) {

              return;

            }


            dragging = true;


            pointerStartX =
              event.clientX;


            pointerStartY =
              event.clientY;

          }
        );



        slider.addEventListener(
          "pointerup",
          function (event) {


            if (
              !dragging
            ) {

              return;

            }


            dragging =
              false;


            const diffX =
              event.clientX -
              pointerStartX;


            const diffY =
              event.clientY -
              pointerStartY;



            /*
              ถ้าเป็นการ scroll แนวตั้ง
              จะไม่เปลี่ยนรูป
            */

            if (
              Math.abs(diffY) >
              Math.abs(diffX)
            ) {

              return;

            }



            /*
              swipe ขั้นต่ำ 45px
            */

            if (
              Math.abs(diffX) <
              45
            ) {

              return;

            }



            /*
              swipe ซ้าย
              = รูปถัดไป
            */

            if (
              diffX < 0
            ) {

              goToPhoto(
                currentIndex + 1
              );

            }



            /*
              swipe ขวา
              = รูปก่อนหน้า
            */

            else {

              goToPhoto(
                currentIndex - 1
              );

            }

          }
        );



        slider.addEventListener(
          "pointercancel",
          function () {

            dragging =
              false;

          }
        );



        /* =====================================================
           KEYBOARD
        ====================================================== */

        document.addEventListener(
          "keydown",
          function (event) {


            if (
              event.key ===
              "ArrowLeft"
            ) {

              goToPhoto(
                currentIndex - 1
              );

            }


            if (
              event.key ===
              "ArrowRight"
            ) {

              goToPhoto(
                currentIndex + 1
              );

            }

          }
        );



        /* =====================================================
           INITIAL
        ====================================================== */

        goToPhoto(0);

      }
    );

  