import React, { useState, useEffect } from 'react'
import classname from 'classname';
import imgBlog2 from './blog2.jpg'
import avatarCmt from './avatar.jpg'
import avatarCmt1 from './avatar1.jpg'
import imgBlog3 from './blog3.jpg'
import BlogItem from './BlogItem';
import { Link, useLocation, useParams } from 'react-router-dom'
import CommentItem from './CommentItem';
import Comments from './BlogComment'
import requestAPI from '../../api';
import moment from 'moment'
import notificationCustom from '../../notification';

export default function BlogDetails(props) {
    //blogid
    const { pathname } = useLocation();
    const idBlogDetails = pathname.slice(13, pathname.length);
    const [value, setValue] = useState('');
    const [liked, setLiked] = useState([]);
    const [statusLiked, setStatusLiked] = useState(false);
    const [blogDetails, setBlogDetails] = useState({});
    const handleChange = (event) => {
        setValue(event.target.value);
    }

    useEffect(() => {
        requestAPI(`/poster/${idBlogDetails}`, 'GET')
            .then(res => {
                if (res) {
                    res.data.listLikes?.map(item => {
                        if (item.idAccountNavigation.fullname === localStorage.getItem('USERNAME')) {
                            setStatusLiked(true);
                        }
                    })
                    setLiked(res.data.listLikes)
                    setBlogDetails(res.data)
                }
            })
            .catch(err => {
                console.log("Faild from server : ", err);
            })
    }, [statusLiked])
    const handleLike = () => {
        let newValue = statusLiked;
        newValue = !newValue;
        requestAPI(`/poster/likes/${idBlogDetails}`, 'PUT', null, { Authorization: `Bearer ${localStorage.getItem('TOKEN')}` })
            .then(res => {
                if (res) {
                    setLiked(res.data.listLikes)
                    if (res.status === 202) {
                        setStatusLiked(false);
                        return;
                    }  // Dislike
                    setStatusLiked(true);
                }
            })
            .catch(err => {
                if (err.response.status === 401) {
                    notificationCustom("Nh???c Nh???", `Vui l??ng ????ng nh???p ????? th???c hi???n ch???c n??ng n??y`, "warning")
                }
            })

    }
    console.log({ blogDetails });
    return (
        <div className="container-wrapper">
            <div className="blogDetails">
                {/* title ?????ng - set components */}
                <div className="author__title blog__title">
                    <h1 className="author__title-content blog__tittle-content">B??I VI???T</h1>
                </div>
                {/* Main */}
                <div className="blogDetails__wrapper">
                    <div className="blogDetails__wrapper-header">
                        <span className="blogDetails__wrapper-header-by">
                            by
                            {/* T??n t??c gi??? ?????ng, ????? API */}
                            <Link className="blogDetails__wrapper-header-authorName" to="/author">
                                {blogDetails?.createdby}
                            </Link>
                        </span>
                        <h1 className="blogDetails__wrapper-header-title">
                            {blogDetails?.title}
                        </h1>
                        <span className="blogDetails__wrapper-header-tag-datePost">
                            <i class="fa fa-clock-o" aria-hidden="true"></i>
                            <span>{blogDetails?.createddate && moment(blogDetails.createddate).format('L')}</span>
                        </span>
                        <div className="blogDetails__wrapper-header-tag">

                            {blogDetails.categoryPosters && blogDetails.categoryPosters.map((category, key) => {
                                return (
                                    <span key={key} className="blogDetails__wrapper-header-tag-category">
                                        <i class="fa fa-tag" aria-hidden="true"></i>
                                        <span>{category.idCategoryNavigation?.name}</span>
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                    <div className="blogDetails__wrapper-container">
                        <div className="blogDetails__wrapper-container-image">
                            <img className="blogDetails__wrapper-container-image-pic" src={blogDetails?.urlImage} />
                        </div>
                        <div className="blogDetails__wrapper-container-content">
                            <h3 className="blogDetails__wrapper-container-content-title">{blogDetails?.sub}</h3>
                            <p className="blogDetails__wrapper-container-content-text">
                                {blogDetails?.description}
                            </p>
                        </div>
                    </div>
                    <div className="blogDetails__wrapper-control" >
                        <Link className="blog__container-main-wrapper-control-btn" to="/blog"> Tr??? l???i </Link>
                    </div>
                </div>
                {/* Action of friend */}
                <div className="blogDetails__action">
                    <div className="action">
                        <div className="action__interface">
                            {/* L?????t ???? likes v?? comments */}
                            <div className="action__interface-actived">
                                <div className={classname("action__interface-actived-likes", { "action__interface-actived-likes liked-active": statusLiked })} onClick={handleLike}>
                                    <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
                                    <span className="action__interface-actived-likes-quantity">
                                        {/* <span className="action__interface-actived-likes-quantity-number"> {liked?.length > 1
                                            ? `${statusLiked ? `B???n v?? ${liked?.length - 1}` : `${liked[0].fullname} v?? ${liked?.length - 1}`} ng?????i kh??c`
                                            : liked?.length === 1
                                                ? `${statusLiked ? `B???n` : `${liked[0].fullname}`}`
                                                : `${statusLiked ? `B???n` : ``}`
                                        } </span> */}
                                        <span className="action__interface-actived-likes-quantity-number"> {liked?.length > 1
                                            ? `${statusLiked ? `B???n v?? ${liked?.length - 1}` : `${liked[0].idAccountNavigation.fullname} v?? ${liked?.length - 1}`} ng?????i kh??c`
                                            : liked?.length === 1
                                                ? `${statusLiked ? `B???n` : `${liked[0].idAccountNavigation.fullname}`}`
                                                : `${statusLiked ? `B???n` : ``}`
                                        } </span>
                                    </span>
                                </div>
                                <label for="txtComment" className="action__interface-actived-comments" >
                                    <i class="fa fa-comment-o" aria-hidden="true"></i>
                                    <span className="action__interface-actived-comments-quantity">
                                        <span className="action__interface-actived-comments-quantity-number">1</span>
                                    </span>
                                </label>
                            </div>
                            {/* B??nh lu???n */}
                            <div className="action__interface-creative">
                                <Comments avatar={avatarCmt1} id={"txtComment"} />
                            </div>
                        </div>
                        {/* Danh s??ch b???n b?? comments */}
                        <CommentItem
                            avatar={avatarCmt}
                            avatarFriend={avatarCmt1}
                        />
                    </div>

                </div>

                {/* Recommendation */}
                <div className="blogDetails__recommend">
                    <div className="blog__container-aside-wrapper-title blogDetails__recommend-title">
                        <h3 className="blog__container-aside-wrapper-title-text blogDetails__recommend-title-text" >B??i Vi???t Li??n Quan</h3>
                    </div>
                    <div className="blogDetails__recommend-content">
                        <BlogItem img={blogDetails} />
                        <BlogItem img={blogDetails} />
                    </div>
                </div>

            </div>

        </div>
    )
}
